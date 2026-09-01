/**
 * MCP Travel Intelligence Tools
 * Wraps weather, stats, quiz, matchmaker, deals, budget optimizer.
 * All business logic lives in the existing feature controllers/services.
 */
import { z } from 'zod';
import axios from 'axios';
import TripPlan from '../../models/TripPlan.js';
import BucketList from '../../models/BucketList.js';
import User from '../../models/User.js';
import { generateTravelPersonality, travelChatbot } from '../../services/aiService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const WeatherSchema = {
  city: z.string().describe('City name to get weather for'),
};

export const TravelStatsSchema = {};

export const BudgetOptimizerSchema = {
  tripId:     z.string().describe('Trip to optimize budget for'),
  targetBudget: z.number().optional().describe('Target budget to optimize towards'),
};

export const PersonalityQuizSchema = {
  answers: z.array(z.object({
    question: z.string(),
    answer:   z.string(),
  })).min(1).describe('Quiz question-answer pairs'),
};

export const ChatbotSchema = {
  message: z.string().min(1),
  context: z.object({
    city: z.string().optional(),
    days: z.number().optional(),
    tripId: z.string().optional(),
  }).optional(),
};

export const DestinationEventsSchema = {
  city:  z.string(),
  month: z.string().optional().describe('Month name, e.g. "October"'),
  interests: z.array(z.string()).optional(),
};

export const VoiceToTripSchema = {
  transcript: z.string().min(3).describe('Speech-to-text transcript from the user'),
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function getWeatherIcon(code) {
  const c = parseInt(code);
  if (c <= 113) return '☀️';
  if (c <= 176) return '⛅';
  if (c <= 248) return '☁️';
  if (c <= 311) return '🌧️';
  if (c <= 395) return '⛈️';
  return '🌤️';
}

async function callGeminiText(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function handleWeather({ city }) {
  try {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const { data } = await axios.get(url, { timeout: 6000 });
    const current = data.current_condition?.[0] || {};
    const forecast = (data.weather || []).slice(0, 5).map(d => ({
      date:    d.date,
      maxTemp: d.maxtempC,
      minTemp: d.mintempC,
      desc:    d.hourly?.[4]?.weatherDesc?.[0]?.value || 'N/A',
      icon:    getWeatherIcon(current.weatherCode),
    }));
    const weather = {
      city,
      temp:      current.temp_C,
      feelsLike: current.FeelsLikeC,
      desc:      current.weatherDesc?.[0]?.value || 'N/A',
      humidity:  current.humidity,
      windSpeed: current.windspeedKmph,
      icon:      getWeatherIcon(current.weatherCode),
      forecast,
    };
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, weather }, null, 2) }] };
  } catch {
    return { content: [{ type: 'text', text: JSON.stringify({ success: false, weather: { city, temp: '--', desc: 'Unavailable', icon: '🌤️', forecast: [] } }, null, 2) }] };
  }
}

export async function handleTravelStats({}, userId) {
  const trips = await TripPlan.find({ 'members.userId': userId }).lean();
  const cities = [...new Set(trips.map(t => t.city).filter(Boolean))];
  const countries = [...new Set(trips.map(t => t.city?.split(',').pop()?.trim()).filter(Boolean))];
  const totalDays   = trips.reduce((s, t) => s + (t.days || 0), 0);
  const totalBudget = trips.reduce((s, t) => s + (t.budget || 0), 0);
  const totalSpent  = trips.reduce((s, t) => s + (t.budgetSpent || 0), 0);

  const badges = [];
  if (trips.length >= 1) badges.push({ id: 'first_trip', name: 'First Flight', icon: '✈️' });
  if (trips.length >= 5) badges.push({ id: 'explorer',   name: 'Explorer',    icon: '🧭' });
  if (trips.length >= 10) badges.push({ id: 'globetrotter', name: 'Globetrotter', icon: '🌍' });
  if (cities.length >= 3) badges.push({ id: 'city_hopper', name: 'City Hopper', icon: '🏙️' });
  if (totalBudget > 0 && totalSpent < totalBudget * 0.9) badges.push({ id: 'budget_master', name: 'Budget Master', icon: '💰' });

  const user = await User.findById(userId).lean();
  const stats = {
    totalTrips: trips.length, totalCities: cities.length, totalCountries: countries.length,
    totalDays, totalBudget, totalSpent, moneySaved: Math.max(0, totalBudget - totalSpent),
    cities, badges,
    memberSince: user?.createdAt,
    tier: user?.membership?.tier || 'Bronze',
    xp:   user?.membership?.experiencePoints || 0,
    culturalDepth:  user?.travelROI?.culturalDepth || 0,
    sustainability: user?.travelROI?.sustainabilityScore || 0,
  };

  return { content: [{ type: 'text', text: JSON.stringify({ success: true, stats }, null, 2) }] };
}

export async function handleBudgetOptimizer({ tripId, targetBudget }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId }).lean();
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const target = targetBudget || trip.budget || trip.estimatedCost;
  const current = trip.estimatedCost || trip.budget || 0;
  const gap = current - target;

  let suggestions = [];

  if (gap > 0) {
    // Over budget — generate AI suggestions
    const prompt = `Trip to ${trip.city} for ${trip.days} days, current budget $${current}, target $${target}.
The itinerary includes: ${JSON.stringify(trip.itinerary?.days?.slice(0, 2))}.
Suggest 5 specific budget reductions. Return JSON: { "suggestions": [{ "action": string, "saving": number, "tradeoff": string }] }`;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      suggestions = parsed.suggestions || [];
    } catch {
      suggestions = [
        { action: 'Switch to a hostel or budget hotel', saving: Math.round(gap * 0.4), tradeoff: 'Less comfort' },
        { action: 'Use local transit instead of taxis', saving: Math.round(gap * 0.2), tradeoff: 'More travel time' },
        { action: 'Eat at local eateries instead of tourist restaurants', saving: Math.round(gap * 0.25), tradeoff: 'Less convenience' },
      ];
    }
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: true,
        currentCost: current,
        targetBudget: target,
        gap: Math.max(0, gap),
        withinBudget: gap <= 0,
        suggestions,
      }, null, 2),
    }],
  };
}

export async function handlePersonalityQuiz({ answers }, userId) {
  const result = await generateTravelPersonality(answers);
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, personality: result }, null, 2) }] };
}

export async function handleChatbot({ message, context }, userId) {
  const result = await travelChatbot(message, context || {});
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, ...result }, null, 2) }] };
}

export async function handleDestinationEvents({ city, month, interests }) {
  const prompt = `List 8 real events, festivals, or seasonal highlights in ${city}${month ? ` during ${month}` : ''}.
${interests?.length ? `User interests: ${interests.join(', ')}.` : ''}
Return JSON: { "events": [{ "name": string, "date": string, "type": string, "description": string, "ticketUrl": string }] }`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, city, month, events: parsed.events || [] }, null, 2) }] };
  } catch {
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, city, month, events: [] }, null, 2) }] };
  }
}

export async function handleVoiceToTrip({ transcript }) {
  // Parse natural language transcript into structured trip parameters
  const prompt = `Parse this voice trip request into structured data: "${transcript}".
Return JSON: { "destination": string, "days": number, "budget": number, "currency": string, "travelWith": string, "interests": string[], "month": string, "originalPrompt": string }
If a field is unclear, use sensible defaults. budget should be a number.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, parsed, originalTranscript: transcript }, null, 2),
      }],
    };
  } catch (err) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: false, error: err.message, originalTranscript: transcript }, null, 2),
      }],
    };
  }
}
