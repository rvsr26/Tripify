import TripPlan from '../models/TripPlan.js';
import User from '../models/User.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { geocode } from '../lib/geocoding.js';
import {
  planTrip as aiPlan,
  generateTripOptions,
  generateFullItinerary,
  chatModifyTrip,
  generatePackingList as aiPackingList,
  generateSafetyInfo
} from '../services/aiService.js';
import * as eliteService from '../services/eliteService.js';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Generate 3 plan options from natural language prompt
// POST /api/planner/options
// ─────────────────────────────────────────────────────────────────────────────
export async function generateOptions(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({ error: 'A trip prompt is required' });
    }
    const options = await generateTripOptions(prompt.trim());
    res.json({ options });
  } catch (e) {
    console.error('generateOptions error:', e);
    res.status(500).json({ error: e.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — User selects a plan; generate full itinerary and save
// POST /api/planner/select
// ─────────────────────────────────────────────────────────────────────────────
export async function selectPlan(req, res) {
  try {
    const { optionKey, optionData, parsedData, naturalPrompt } = req.body;
    const userId = req.userId;

    if (!optionKey || !optionData || !parsedData) {
      return res.status(400).json({ error: 'optionKey, optionData, and parsedData are required' });
    }

    const itinerary = await generateFullItinerary(optionData, naturalPrompt || '', parsedData);

    const user = await User.findById(userId);
    const mergedInterests = user?.preferences?.length
      ? Array.from(new Set([...(parsedData.interests || []), ...user.preferences]))
      : (parsedData.interests || []);

    if (mergedInterests.length && user) {
      user.preferences = Array.from(new Set([...user.preferences, ...mergedInterests]));
      await user.save();
    }

    const doc = await TripPlan.create({
      userId,
      admin: userId, 
      members: [{ userId, role: 'admin' }],
      inviteToken: uuidv4(),
      location: await geocode(parsedData.destination), // Geocoding added
      title: `${parsedData.days}-Day ${optionData.name} Trip to ${parsedData.destination}`,
      city:                  parsedData.destination,
      budget:                optionData.estimatedCost,
      days:                  parsedData.days,
      interests:             mergedInterests,
      naturalLanguagePrompt: naturalPrompt || '',
      selectedOption:        optionKey,
      optionName:            optionData.name,
      currency:              parsedData.currency || '$',
      month:                 parsedData.month || '',
      travelWith:            parsedData.travelWith || '',
      prompt:                naturalPrompt || '',
      itinerary: {
        ...itinerary,
        days: itinerary.days.map(day => ({
          ...day,
          activities: day.activities.map(act => ({
            ...act,
            reviews: (act.reviews || []).map(g => ({
              author: g.author_name || 'Google User',
              rating: g.rating || 5,
              review: g.snippet || g.summary || 'Google Review',
              createdAt: g.date || new Date().toISOString(),
              isExternal: true,
              link: g.link || g.share_link || null,
              // Extract the best quality image URLs
              images: (g.images || []).map(img => img.original || img.thumbnail).filter(Boolean),
            })).filter(r => r.review && r.review !== 'Google Review')
          }))
        }))
      },
      packingList:           itinerary.packingList || null,
      estimatedCost:         itinerary.totalCost || optionData.estimatedCost || 0,
    });

    // 🏆 Elite Feature: Calculate Travel ROI for the new trip
    await eliteService.calculateTripROI(doc._id);

    res.json({ plan: doc });
  } catch (e) {
    console.error('selectPlan error:', e);
    res.status(500).json({ error: e.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLABORATIVE FEATURES
// ─────────────────────────────────────────────────────────────────────────────

export async function updateTripSettings(req, res) {
  try {
    const { id } = req.params;
    const { isOpenToJoin, maxMembers, title } = req.body;
    const trip = await TripPlan.findOne({ _id: id, admin: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or not admin' });

    if (typeof isOpenToJoin === 'boolean') trip.isOpenToJoin = isOpenToJoin;
    if (maxMembers) trip.maxMembers = maxMembers;
    if (title) trip.title = title;

    await trip.save();
    req.io.to(id).emit('tripUpdated', trip);
    res.json({ trip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function joinTripByToken(req, res) {
  try {
    const { token } = req.params;
    const userId = req.userId;
    const trip = await TripPlan.findOne({ inviteToken: token });
    if (!trip) return res.status(404).json({ error: 'Invalid invite link' });

    const isMember = trip.members.some(m => m.userId.toString() === userId);
    if (isMember) return res.json({ message: 'Already a member', trip });

    if (trip.members.length >= trip.maxMembers) {
      return res.status(400).json({ error: 'Trip is full' });
    }

    trip.members.push({ userId, role: 'member' });
    await trip.save();
    const populatedTrip = await TripPlan.findById(trip._id).populate('members.userId', 'name username');
    req.io.to(trip._id.toString()).emit('tripUpdated', populatedTrip);
    res.json({ message: 'Joined successfully', trip: populatedTrip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function requestToJoin(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    const trip = await TripPlan.findById(id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (!trip.isOpenToJoin) return res.status(403).json({ error: 'This trip is not open to strangers' });

    const isMember = trip.members.some(m => m.userId.toString() === userId);
    if (isMember) return res.status(400).json({ error: 'Already a member' });

    const existingReq = trip.joinRequests.some(r => r.userId.toString() === userId && r.status === 'pending');
    if (existingReq) return res.status(400).json({ error: 'Request already pending' });

    trip.joinRequests.push({ userId, message, status: 'pending' });
    await trip.save();
    const populatedTrip = await TripPlan.findById(trip._id).populate('joinRequests.userId', 'name username');
    req.io.to(id).emit('tripUpdated', populatedTrip);
    res.json({ success: true, message: 'Request sent to admin' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function handleJoinRequest(req, res) {
  try {
    const { id, userId: targetUserId } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'
    const adminId = req.userId;

    const trip = await TripPlan.findOne({ _id: id, admin: adminId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or not admin' });

    const requestIndex = trip.joinRequests.findIndex(r => r.userId.toString() === targetUserId && r.status === 'pending');
    if (requestIndex === -1) return res.status(404).json({ error: 'Request not found' });

    if (status === 'accepted') {
      if (trip.members.length >= trip.maxMembers) return res.status(400).json({ error: 'Trip is full' });
      trip.joinRequests[requestIndex].status = 'accepted';
      trip.members.push({ userId: targetUserId, role: 'member' });
    } else {
      trip.joinRequests[requestIndex].status = 'declined';
    }

    await trip.save();
    const populatedTrip = await TripPlan.findById(id).populate('members.userId', 'name username').populate('joinRequests.userId', 'name username');
    req.io.to(id).emit('tripUpdated', populatedTrip);
    res.json({ trip: populatedTrip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function removeMember(req, res) {
  try {
    const { id, userId: targetUserId } = req.params;
    const actorId = req.userId;

    const trip = await TripPlan.findById(id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const isAdmin = trip.admin.toString() === actorId;
    const isSelf = actorId === targetUserId;

    if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Unauthorized' });
    if (isAdmin && isSelf) return res.status(400).json({ error: 'Admin cannot leave trip (delete it instead)' });

    trip.members = trip.members.filter(m => m.userId.toString() !== targetUserId);
    await trip.save();
    const populatedTrip = await TripPlan.findById(id).populate('members.userId', 'name username');
    req.io.to(id).emit('tripUpdated', populatedTrip);
    res.json({ success: true, trip: populatedTrip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI CHAT — Modify trip via natural language
// ─────────────────────────────────────────────────────────────────────────────
export async function chatWithTrip(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    const trip = await TripPlan.findOne({ _id: id, 'members.userId': userId });
    if (!trip) return res.status(404).json({ error: 'trip not found or not a member' });

    const updatedItinerary = await chatModifyTrip(
      trip.itinerary,
      message.trim(),
      { title: trip.title, city: trip.city }
    );

    const aiMessage = updatedItinerary.aiMessage || 'Itinerary updated!';
    delete updatedItinerary.aiMessage;

    const newMessages = [
      { role: 'user', content: message.trim(), timestamp: new Date() },
      { role: 'ai',   content: aiMessage,       timestamp: new Date() },
    ];

    trip.chatHistory  = [...(trip.chatHistory || []), ...newMessages];
    trip.itinerary    = updatedItinerary;
    if (updatedItinerary.totalCost) trip.estimatedCost = updatedItinerary.totalCost;
    
    await trip.save();

    // 🏆 Elite Feature: Recalculate ROI after manual modification
    await eliteService.calculateTripROI(id);

    req.io.to(id).emit('tripUpdated', trip);
    res.json({ trip, aiMessage, chatHistory: trip.chatHistory });
  } catch (e) {
    console.error('chatWithTrip error:', e);
    res.status(500).json({ error: e.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OTHER LOGIC 
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePackingListController(req, res) {
  try {
    const { id } = req.params;
    const trip = await TripPlan.findOne({ _id: id, 'members.userId': req.userId });
    if (!trip) return res.status(404).json({ error: 'trip not found' });

    const packing = await aiPackingList(trip.city, trip.days, trip.interests, trip.month);
    trip.packingList = packing;
    await trip.save();
    req.io.to(id).emit('tripUpdated', trip);
    res.json({ packingList: packing });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getSafetyInfoController(req, res) {
  try {
    const { id } = req.params;
    const trip = await TripPlan.findOne({ _id: id, 'members.userId': req.userId });
    if (!trip) return res.status(404).json({ error: 'trip not found' });

    // Assuming we just generate on the fly since we don't save it to the DB model yet
    const safetyInfo = await generateSafetyInfo(trip.city);
    res.json(safetyInfo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function addExpenseController(req, res) {
  try {
    const { id } = req.params;
    const { description, amount, category, splitAmong } = req.body;
    const trip = await TripPlan.findOne({ _id: id, 'members.userId': req.userId });
    if (!trip) return res.status(404).json({ error: 'trip not found' });

    const newExpense = {
      description: description || 'Expense',
      amount: Number(amount),
      category: category || 'Other',
      paidBy: req.userId,
      splitAmong: splitAmong || trip.members.map(m => m.userId), // Split evenly by default
      date: new Date()
    };

    trip.expenses.push(newExpense);
    trip.budgetSpent = trip.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    await trip.save();
    
    // Return populated for frontend resolving user names
    const updatedTrip = await TripPlan.findById(id).populate('members.userId', 'name username');
    req.io.to(id).emit('tripUpdated', updatedTrip);
    res.json({ trip: updatedTrip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateTripController(req, res) {
  try {
    const { id } = req.params;
    const { isPublic, budgetSpent, title, expense } = req.body;
    const trip = await TripPlan.findOne({ _id: id, 'members.userId': req.userId });
    if (!trip) return res.status(404).json({ error: 'trip not found' });

    if (typeof isPublic === 'boolean') trip.isPublic = isPublic;
    if (typeof budgetSpent === 'number') trip.budgetSpent = budgetSpent;
    if (title) trip.title = title;
    if (expense && expense.amount) {
      trip.expenses.push({
        description: expense.description || 'Expense',
        amount:      expense.amount,
        category:    expense.category || 'Other',
        date:        new Date()
      });
      trip.budgetSpent = trip.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    }
    await trip.save();
    req.io.to(id).emit('tripUpdated', trip);
    res.json({ trip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function createPlan(req, res) {
  try {
    const { city, budget, days, interests = [], title } = req.body;
    const userId = req.userId;
    if (!city || !days) return res.status(400).json({ error: 'city and days are required' });

    const user = await User.findById(userId);
    const pastTrips  = await TripPlan.find({ userId }).select('city').limit(5);
    const pastCities = pastTrips.map(t => t.city).join(', ');

    if (interests.length > 0 && user) {
      user.preferences = Array.from(new Set([...user.preferences, ...interests]));
      await user.save();
    }

    const mergedInterests = user ? Array.from(new Set([...interests, ...user.preferences])) : interests;
    const prompt = `Plan a ${days}-day trip to ${city} with a budget of ${budget || 'flexible'}. Interests: ${mergedInterests.join(', ')}...`;
    const itinerary = await aiPlan(prompt, { city, budget, days, interests });

    const doc = await TripPlan.create({
      userId,
      admin: userId,
      members: [{ userId, role: 'admin' }],
      inviteToken: uuidv4(),
      location: await geocode(city), // Geocoding added
      title: title || `${days}-Day Trip to ${city}`,
      city, budget, days,
      interests: mergedInterests,
      prompt, itinerary,
      estimatedCost: itinerary.totalCost || 0,
    });
    res.json({ plan: doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getMyTrips(req, res) {
  try {
    const trips = await TripPlan.find({ 'members.userId': req.userId })
      .populate('members.userId', 'name username')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ trips });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getTripById(req, res) {
  try {
    const trip = await TripPlan.findById(req.params.id)
      .populate('members.userId', 'name username bio')
      .populate('admin', 'name username')
      .populate('joinRequests.userId', 'name username bio');
    
    if (!trip) return res.status(404).json({ error: 'trip not found' });
    
    const isMember = trip.members.some(m => m.userId._id.toString() === req.userId);
    if (!isMember && !trip.isPublic) return res.status(403).json({ error: 'Access denied' });
    
    res.json({ trip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function deleteTrip(req, res) {
  try {
    const trip = await TripPlan.findOneAndDelete({ _id: req.params.id, admin: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or not admin' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getDestinationReviews(req, res) {
  try {
    const { id } = req.params;
    const trip = await TripPlan.findById(id);
    if (!trip) return res.status(404).json({ error: 'trip not found' });

    const isMember = trip.members.some(m => m.userId.toString() === req.userId);
    if (!isMember && !trip.isPublic) return res.status(403).json({ error: 'Access denied' });

    if (!process.env.SERPAPI_KEY) {
      return res.status(400).json({ error: 'Missing SERPAPI_KEY in environment' });
    }

    let llParam = '';
    if (trip.location && trip.location.lat && trip.location.lng) {
      llParam = `&ll=@${trip.location.lat},${trip.location.lng},12z`;
    }

    const query = `Top attractions in ${trip.city}`;
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}${llParam}&api_key=${process.env.SERPAPI_KEY}`;

    let reviews = [];
    try {
      const response = await axios.get(url);
      const local_results = response.data.local_results || [];
      
      // Map and ensure each has a valid HD thumbnail
      reviews = local_results.map(spot => {
        let thumb = spot.thumbnail || spot.photos?.[0]?.thumbnail || spot.gps_coordinates?.[0]?.thumbnail || null;
        
        // HD Upgrade Trick: If it's a Google Googlecontent URL, replace the size parameter with s1600
        if (thumb && (thumb.includes('googleusercontent.com') || thumb.includes('ggpht.com'))) {
          thumb = thumb.replace(/=s\d+/, '=s1600').replace(/\/s\d+-/, '/s1600-');
        }
        
        return {
          ...spot,
          thumbnail: thumb
        };
      });
    } catch (apiErr) {
      console.error('SerpAPI error:', apiErr.response?.data || apiErr.message);
    }

    res.json({ reviews });
  } catch (e) {
    console.error('getDestinationReviews error:', e);
    res.status(500).json({ error: e.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKFILL — Add coordinates to trips that are missing them
// POST /api/planner/backfill-coords
// ─────────────────────────────────────────────────────────────────────────────
export async function backfillCoordinates(req, res) {
  try {
    const userId = req.userId;
    const trips = await TripPlan.find({
      'members.userId': userId,
      $or: [
        { location: null },
        { 'location.lat': null },
        { 'location.lat': { $exists: false } },
      ]
    });

    let fixed = 0;
    for (const trip of trips) {
      if (trip.city) {
        const coords = await geocode(trip.city);
        if (coords && coords.lat) {
          trip.location = coords;
          await trip.save();
          fixed++;
        }
      }
    }

    res.json({ success: true, totalMissing: trips.length, fixed });
  } catch (e) {
    console.error('backfillCoordinates error:', e);
    res.status(500).json({ error: e.message });
  }
}

