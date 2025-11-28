import TripPlan from '../models/TripPlan.js';
import BucketList from '../models/BucketList.js';
import Story from '../models/Story.js';
import Journal from '../models/Journal.js';
import User from '../models/User.js';
import { generateTravelPersonality, travelChatbot, generateStoryCaptions } from '../services/aiService.js';
import axios from 'axios';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. AI TRAVEL PERSONALITY QUIZ
// ═══════════════════════════════════════════════════════════════════════════════

export async function getQuizResult(req, res) {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }
    const result = await generateTravelPersonality(answers);
    res.json({ personality: result });
  } catch (e) {
    console.error('Quiz error:', e);
    res.status(500).json({ error: e.message });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TRAVEL STATS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export async function getTravelStats(req, res) {
  try {
    const userId = req.userId;
    const trips = await TripPlan.find({ 'members.userId': userId }).lean();

    const cities = [...new Set(trips.map(t => t.city).filter(Boolean))];
    const countries = [...new Set(trips.map(t => {
      const c = t.city?.split(',').pop()?.trim();
      return c || t.city;
    }).filter(Boolean))];

    const totalDays = trips.reduce((s, t) => s + (t.days || 0), 0);
    const totalBudget = trips.reduce((s, t) => s + (t.budget || 0), 0);
    const totalSpent = trips.reduce((s, t) => s + (t.budgetSpent || 0), 0);
    const totalEstimated = trips.reduce((s, t) => s + (t.estimatedCost || 0), 0);

    // Top destinations
    const destCount = {};
    trips.forEach(t => { if (t.city) destCount[t.city] = (destCount[t.city] || 0) + 1; });
    const topDestinations = Object.entries(destCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    // Monthly activity
    const monthlyTrips = {};
    trips.forEach(t => {
      const m = new Date(t.createdAt).toLocaleString('en', { month: 'short', year: 'numeric' });
      monthlyTrips[m] = (monthlyTrips[m] || 0) + 1;
    });

    // Badges calculation
    const badges = [];
    if (trips.length >= 1) badges.push({ id: 'first_trip', name: 'First Flight', icon: '✈️', desc: 'Created your first trip' });
    if (trips.length >= 5) badges.push({ id: 'explorer', name: 'Explorer', icon: '🧭', desc: 'Planned 5 trips' });
    if (trips.length >= 10) badges.push({ id: 'globetrotter', name: 'Globetrotter', icon: '🌍', desc: 'Planned 10 trips' });
    if (cities.length >= 3) badges.push({ id: 'city_hopper', name: 'City Hopper', icon: '🏙️', desc: 'Visited 3+ cities' });
    if (cities.length >= 5) badges.push({ id: 'five_cities', name: '5 Cities Club', icon: '🗺️', desc: 'Visited 5+ cities' });
    if (cities.length >= 10) badges.push({ id: 'ten_cities', name: 'World Wanderer', icon: '🌐', desc: 'Visited 10+ cities' });
    if (totalBudget > 0 && totalSpent < totalBudget * 0.9) badges.push({ id: 'budget_master', name: 'Budget Master', icon: '💰', desc: 'Stayed under budget' });
    if (totalDays >= 30) badges.push({ id: 'month_abroad', name: 'Month Abroad', icon: '📅', desc: '30+ days of travel planned' });
    if (totalDays >= 100) badges.push({ id: 'century', name: 'Century Traveler', icon: '💯', desc: '100+ days of travel' });

    const user = await User.findById(userId).lean();
    const friendCount = 0; // Would need friends aggregation

    res.json({
      stats: {
        totalTrips: trips.length,
        totalCities: cities.length,
        totalCountries: countries.length,
        totalDays,
        totalBudget,
        totalSpent,
        totalEstimated,
        moneySaved: Math.max(0, totalBudget - totalSpent),
        avgTripDays: trips.length ? Math.round(totalDays / trips.length) : 0,
        avgBudget: trips.length ? Math.round(totalBudget / trips.length) : 0,
        cities,
        topDestinations,
        monthlyTrips,
        badges,
        memberSince: user?.createdAt,
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SPLIT EXPENSES
// ═══════════════════════════════════════════════════════════════════════════════

export async function addExpense(req, res) {
  try {
    const { id } = req.params;
    const { description, amount, category, paidBy, splitAmong } = req.body;
    const trip = await TripPlan.findOne({ _id: id, 'members.userId': req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    trip.expenses.push({
      description: description || 'Expense',
      amount: amount || 0,
      category: category || 'Other',
      paidBy: paidBy || req.userId,
      splitAmong: splitAmong || trip.members.map(m => m.userId.toString()),
      date: new Date()
    });
    trip.budgetSpent = trip.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    await trip.save();

    res.json({ expenses: trip.expenses, budgetSpent: trip.budgetSpent });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getSettlements(req, res) {
  try {
    const { id } = req.params;
    const trip = await TripPlan.findById(id)
      .populate('members.userId', 'name username')
      .lean();
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const members = trip.members.map(m => ({ id: m.userId._id.toString(), name: m.userId.name }));
    const balances = {};
    members.forEach(m => { balances[m.id] = 0; });

    (trip.expenses || []).forEach(exp => {
      const paidBy = exp.paidBy?.toString() || trip.admin?.toString();
      const splitList = exp.splitAmong?.length ? exp.splitAmong.map(s => s.toString()) : members.map(m => m.id);
      const share = (exp.amount || 0) / splitList.length;

      if (balances[paidBy] !== undefined) balances[paidBy] += exp.amount || 0;
      splitList.forEach(uid => {
        if (balances[uid] !== undefined) balances[uid] -= share;
      });
    });

    // Calculate settlements
    const creditors = [];
    const debtors = [];
    Object.entries(balances).forEach(([uid, bal]) => {
      const member = members.find(m => m.id === uid);
      if (bal > 0.01) creditors.push({ ...member, amount: bal });
      else if (bal < -0.01) debtors.push({ ...member, amount: Math.abs(bal) });
    });

    const settlements = [];
    let ci = 0, di = 0;
    while (ci < creditors.length && di < debtors.length) {
      const amount = Math.min(creditors[ci].amount, debtors[di].amount);
      settlements.push({
        from: debtors[di].name,
        fromId: debtors[di].id,
        to: creditors[ci].name,
        toId: creditors[ci].id,
        amount: Math.round(amount * 100) / 100
      });
      creditors[ci].amount -= amount;
      debtors[di].amount -= amount;
      if (creditors[ci].amount < 0.01) ci++;
      if (debtors[di].amount < 0.01) di++;
    }

    res.json({ settlements, balances, totalExpenses: trip.budgetSpent || 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. BUCKET LIST
// ═══════════════════════════════════════════════════════════════════════════════

export async function getBucketList(req, res) {
  try {
    let bucket = await BucketList.findOne({ userId: req.userId });
    if (!bucket) bucket = await BucketList.create({ userId: req.userId, items: [] });
    res.json({ bucketList: bucket });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function addBucketItem(req, res) {
  try {
    const { destination, country, emoji, priority, notes, location } = req.body;
    if (!destination) return res.status(400).json({ error: 'Destination required' });

    let bucket = await BucketList.findOne({ userId: req.userId });
    if (!bucket) bucket = await BucketList.create({ userId: req.userId, items: [] });

    bucket.items.push({ destination, country, emoji: emoji || '📍', priority: priority || 'medium', notes, location });
    await bucket.save();
    res.json({ bucketList: bucket });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function updateBucketItem(req, res) {
  try {
    const { itemId } = req.params;
    const { visited, notes, priority, location } = req.body;
    const bucket = await BucketList.findOne({ userId: req.userId });
    if (!bucket) return res.status(404).json({ error: 'Not found' });

    const item = bucket.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (typeof visited === 'boolean') { item.visited = visited; if (visited) item.visitedDate = new Date(); }
    if (notes !== undefined) item.notes = notes;
    if (priority) item.priority = priority;
    if (location) item.location = location;
    await bucket.save();
    res.json({ bucketList: bucket });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function removeBucketItem(req, res) {
  try {
    const { itemId } = req.params;
    const bucket = await BucketList.findOne({ userId: req.userId });
    if (!bucket) return res.status(404).json({ error: 'Not found' });
    bucket.items = bucket.items.filter(i => i._id.toString() !== itemId);
    await bucket.save();
    res.json({ bucketList: bucket });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TRIP STORIES
// ═══════════════════════════════════════════════════════════════════════════════

export async function createStory(req, res) {
  try {
    const { tripId, title, slides } = req.body;
    const story = await Story.create({
      userId: req.userId,
      tripId,
      title: title || 'My Trip Story',
      slides: slides || [],
    });
    res.json({ story });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getStories(req, res) {
  try {
    const stories = await Story.find({ isPublic: true })
      .populate('userId', 'name username')
      .populate('tripId', 'title city days')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ stories });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getStory(req, res) {
  try {
    const story = await Story.findById(req.params.id)
      .populate('userId', 'name username')
      .populate('tripId', 'title city days');
    if (!story) return res.status(404).json({ error: 'Story not found' });
    story.views += 1;
    await story.save();
    res.json({ story });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function likeStory(req, res) {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Not found' });
    const idx = story.likes.indexOf(req.userId);
    if (idx > -1) story.likes.splice(idx, 1);
    else story.likes.push(req.userId);
    await story.save();
    res.json({ likes: story.likes.length, liked: idx === -1 });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function generateCaptions(req, res) {
  try {
    const { tripTitle, city, highlights } = req.body;
    const result = await generateStoryCaptions(tripTitle, city, highlights || []);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TRAVEL JOURNAL
// ═══════════════════════════════════════════════════════════════════════════════

export async function getJournal(req, res) {
  try {
    const { tripId } = req.params;
    let journal = await Journal.findOne({ userId: req.userId, tripId });
    if (!journal) journal = await Journal.create({ userId: req.userId, tripId, entries: [] });
    res.json({ journal });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function addJournalEntry(req, res) {
  try {
    const { tripId } = req.params;
    const { title, content, mood, location, dayNumber, photos } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    let journal = await Journal.findOne({ userId: req.userId, tripId });
    if (!journal) journal = await Journal.create({ userId: req.userId, tripId, entries: [] });

    journal.entries.push({
      title,
      content,
      mood: mood || 'happy',
      location,
      dayNumber,
      photos: Array.isArray(photos) ? photos.filter(Boolean) : [],
    });
    await journal.save();
    res.json({ journal });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. AI TRAVEL CHATBOT
// ═══════════════════════════════════════════════════════════════════════════════

export async function chatbotMessage(req, res) {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const result = await travelChatbot(message, context || {});
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. TRIP TEMPLATES MARKETPLACE
// ═══════════════════════════════════════════════════════════════════════════════

export async function publishTemplate(req, res) {
  try {
    const { id } = req.params;
    const trip = await TripPlan.findOne({ _id: id, admin: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or not admin' });
    trip.isPublic = true;
    trip.isTemplate = true;
    await trip.save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function getTemplates(req, res) {
  try {
    const { search, maxDays, maxBudget } = req.query;
    let query = { isPublic: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (maxDays) query.days = { $lte: parseInt(maxDays) };
    if (maxBudget) query.budget = { $lte: parseInt(maxBudget) };

    const templates = await TripPlan.find(query)
      .populate('admin', 'name username')
      .select('title city days budget currency estimatedCost selectedOption optionName likes members createdAt admin')
      .sort({ 'likes.length': -1, createdAt: -1 })
      .limit(30)
      .lean();
    res.json({ templates });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function cloneTemplate(req, res) {
  try {
    const { id } = req.params;
    const source = await TripPlan.findById(id).lean();
    if (!source) return res.status(404).json({ error: 'Template not found' });

    const { v4: uuidv4 } = await import('uuid');
    const clone = await TripPlan.create({
      userId: req.userId,
      admin: req.userId,
      members: [{ userId: req.userId, role: 'admin' }],
      inviteToken: uuidv4(),
      title: `${source.title} (Clone)`,
      city: source.city,
      budget: source.budget,
      days: source.days,
      interests: source.interests,
      itinerary: source.itinerary,
      packingList: source.packingList,
      estimatedCost: source.estimatedCost,
      currency: source.currency,
      month: source.month,
      selectedOption: source.selectedOption,
      optionName: source.optionName,
      location: source.location,
    });

    res.json({ plan: clone });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. TRAVEL BUDDY MATCHMAKER
// ═══════════════════════════════════════════════════════════════════════════════

export async function getMatchCandidates(req, res) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    const myTrips = await TripPlan.find({ 'members.userId': userId }).lean();
    const myInterests = user?.preferences || [];
    const myCities = [...new Set(myTrips.map(t => t.city).filter(Boolean))];

    // Find users with similar interests/destinations
    const allUsers = await User.find({ _id: { $ne: userId } })
      .select('name username bio preferences createdAt')
      .limit(100)
      .lean();

    const candidates = await Promise.all(allUsers.map(async (u) => {
      const theirTrips = await TripPlan.find({ 'members.userId': u._id }).select('city days budget').lean();
      const theirCities = [...new Set(theirTrips.map(t => t.city).filter(Boolean))];
      const theirInterests = u.preferences || [];

      // Calculate compatibility
      const sharedInterests = myInterests.filter(i => theirInterests.includes(i));
      const sharedCities = myCities.filter(c => theirCities.includes(c));
      const score = (sharedInterests.length * 20) + (sharedCities.length * 15) + (theirTrips.length * 5);

      return {
        _id: u._id,
        name: u.name,
        username: u.username,
        bio: u.bio,
        tripCount: theirTrips.length,
        sharedInterests,
        sharedCities,
        compatibility: Math.min(100, score),
        topCities: theirCities.slice(0, 3),
        interests: theirInterests.slice(0, 5),
      };
    }));

    candidates.sort((a, b) => b.compatibility - a.compatibility);
    res.json({ candidates: candidates.slice(0, 20) });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. LIVE WEATHER
// ═══════════════════════════════════════════════════════════════════════════════

export async function getWeather(req, res) {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City required' });

    // Use wttr.in free API (no key needed)
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data;

    const current = data.current_condition?.[0] || {};
    const forecast = (data.weather || []).slice(0, 5).map(d => ({
      date: d.date,
      maxTemp: d.maxtempC,
      minTemp: d.mintempC,
      desc: d.hourly?.[4]?.weatherDesc?.[0]?.value || 'N/A',
      icon: getWeatherIcon(current.weatherCode),
    }));

    res.json({
      weather: {
        city,
        temp: current.temp_C,
        feelsLike: current.FeelsLikeC,
        desc: current.weatherDesc?.[0]?.value || 'N/A',
        humidity: current.humidity,
        windSpeed: current.windspeedKmph,
        icon: getWeatherIcon(current.weatherCode),
        forecast,
      }
    });
  } catch (e) {
    console.error('Weather error:', e.message);
    res.json({
      weather: { city: req.query.city, temp: '--', desc: 'Unavailable', icon: '🌤️', forecast: [] }
    });
  }
}

function getWeatherIcon(code) {
  const c = parseInt(code);
  if (c <= 113) return '☀️';
  if (c <= 176) return '⛅';
  if (c <= 248) return '☁️';
  if (c <= 311) return '🌧️';
  if (c <= 395) return '⛈️';
  return '🌤️';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. DEAL ALERTS (Simulated)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getDealAlerts(req, res) {
  try {
    const userId = req.userId;
    const bucket = await BucketList.findOne({ userId }).lean();
    const trips = await TripPlan.find({ 'members.userId': userId }).select('city').lean();

    const destinations = [
      ...(bucket?.items?.map(i => i.destination) || []),
      ...trips.map(t => t.city)
    ].filter(Boolean);

    const uniqueDests = [...new Set(destinations)].slice(0, 8);

    // Generate realistic-looking simulated deals
    const dealTypes = [
      { type: 'flight', provider: 'Skyscanner', icon: '✈️' },
      { type: 'hotel', provider: 'Booking.com', icon: '🏨' },
      { type: 'experience', provider: 'GetYourGuide', icon: '🎫' },
    ];

    const deals = uniqueDests.flatMap(dest =>
      dealTypes.slice(0, 1 + Math.floor(Math.random() * 2)).map(dt => ({
        id: `${dest}-${dt.type}-${Date.now()}`,
        destination: dest,
        type: dt.type,
        provider: dt.provider,
        icon: dt.icon,
        title: dt.type === 'flight' ? `Flights to ${dest}` :
               dt.type === 'hotel' ? `Hotels in ${dest}` :
               `Top experiences in ${dest}`,
        discount: `${15 + Math.floor(Math.random() * 35)}% off`,
        originalPrice: 200 + Math.floor(Math.random() * 800),
        dealPrice: 100 + Math.floor(Math.random() * 500),
        expiresIn: `${1 + Math.floor(Math.random() * 5)} days`,
        link: dt.type === 'flight' ? `https://www.skyscanner.com/transport/flights/?q=${encodeURIComponent(dest)}` :
              dt.type === 'hotel' ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}` :
              `https://www.getyourguide.com/s/?q=${encodeURIComponent(dest)}`,
      }))
    );

    res.json({ deals: deals.slice(0, 12) });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// Build verification patch on 11/28/2025, 9:34:00 AM
