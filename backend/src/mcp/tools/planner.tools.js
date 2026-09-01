/**
 * MCP Planner Tools
 * Wraps the existing planner controller and AI service functions.
 * No business logic here — pure thin wrappers that call existing services.
 */
import { z } from 'zod';
import TripPlan from '../../models/TripPlan.js';
import User from '../../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { geocode } from '../../lib/geocoding.js';
import {
  generateTripOptions,
  generateFullItinerary,
  chatModifyTrip,
  generatePackingList,
  generateSafetyInfo,
  generatePlaceReviews,
} from '../../services/aiService.js';
import { eliteService } from '../../services/eliteService.js';

// ─── Input Schemas ──────────────────────────────────────────────────────────

export const GenerateTripOptionsSchema = {
  prompt: z.string().min(5).describe('Natural language trip request, e.g. "7 days in Japan under ₹80,000"'),
};

export const SelectPlanSchema = {
  optionKey:     z.enum(['A', 'B', 'C']).describe('Which plan to generate the full itinerary for'),
  optionData:    z.object({
    name:          z.string(),
    estimatedCost: z.number().optional(),
    accommodation: z.string().optional(),
    transport:     z.string().optional(),
    highlights:    z.array(z.string()).optional(),
  }).describe('Option details from generate_trip_options'),
  parsedData:    z.object({
    destination: z.string(),
    days:        z.number(),
    currency:    z.string().optional(),
    month:       z.string().optional(),
    travelWith:  z.string().optional(),
    interests:   z.array(z.string()).optional(),
  }).describe('Parsed trip parameters'),
  naturalPrompt: z.string().optional().describe('Original natural language prompt'),
};

export const ModifyTripSchema = {
  tripId:  z.string().describe('ID of the trip to modify'),
  message: z.string().min(3).describe('Modification request, e.g. "Add a cooking class on Day 3"'),
};

export const PackingListSchema = {
  tripId:     z.string().describe('Trip ID'),
  regenerate: z.boolean().optional().default(false).describe('Force regeneration even if cached'),
};

export const SafetyInfoSchema = {
  tripId: z.string().optional().describe('Trip ID (city will be read from trip)'),
  city:   z.string().optional().describe('City name (used if no tripId)'),
};

export const AddExpenseSchema = {
  tripId:      z.string(),
  description: z.string(),
  amount:      z.number().positive(),
  category:    z.enum(['Food', 'Transport', 'Hotel', 'Activity', 'Shopping', 'Other']).optional().default('Other'),
  paidBy:      z.string().optional().describe('userId of who paid'),
  splitAmong:  z.array(z.string()).optional().describe('Array of userIds to split among'),
};

export const GetSettlementsSchema = {
  tripId: z.string(),
};

export const ReviewSummarySchema = {
  tripId: z.string().optional(),
  placeId: z.string().optional().describe('Place name or Google Place ID'),
};

export const TripSummarySchema = {
  tripId: z.string(),
};

export const RoutOptimizerSchema = {
  tripId: z.string(),
  day:    z.number().int().min(1).optional().describe('Specific day to optimize, or all days if omitted'),
};

// ─── Tool Handler Implementations ───────────────────────────────────────────

export async function handleGenerateTripOptions({ prompt }, userId) {
  const options = await generateTripOptions(prompt.trim());
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ success: true, options }, null, 2),
    }],
  };
}

export async function handleSelectPlan({ optionKey, optionData, parsedData, naturalPrompt }, userId) {
  const itinerary = await generateFullItinerary(optionData, naturalPrompt || '', parsedData);

  const user = await User.findById(userId);
  const mergedInterests = user?.preferences?.length
    ? Array.from(new Set([...(parsedData.interests || []), ...user.preferences]))
    : (parsedData.interests || []);

  if (mergedInterests.length && user) {
    user.preferences = Array.from(new Set([...user.preferences, ...mergedInterests]));
    await user.save();
  }

  const location = await geocode(parsedData.destination);

  const doc = await TripPlan.create({
    userId,
    admin: userId,
    members: [{ userId, role: 'admin' }],
    inviteToken: uuidv4(),
    location,
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
    itinerary,
    packingList:           itinerary.packingList || null,
    estimatedCost:         itinerary.totalCost || optionData.estimatedCost || 0,
  });

  // Background ROI calculation (non-blocking)
  eliteService.calculateTripROI(doc._id).catch(() => {});

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ success: true, tripId: doc._id, plan: doc }, null, 2),
    }],
  };
}

export async function handleModifyTrip({ tripId, message }, userId) {
  const trip = await TripPlan.findOne({
    _id: tripId,
    'members.userId': userId,
  });
  if (!trip) throw new Error(`Trip ${tripId} not found or access denied`);

  const updated = await chatModifyTrip(
    trip.itinerary,
    message,
    { title: trip.title, city: trip.city },
  );

  if (!updated.isMock) {
    trip.itinerary = updated;
    trip.chatHistory.push({ role: 'user', content: message });
    trip.chatHistory.push({ role: 'ai', content: updated.aiMessage || 'Itinerary updated.' });
    await trip.save();
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: true,
        aiMessage: updated.aiMessage || 'Itinerary updated.',
        tripId,
        isMock: updated.isMock || false,
      }, null, 2),
    }],
  };
}

export async function handlePackingList({ tripId, regenerate }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId });
  if (!trip) throw new Error(`Trip ${tripId} not found or access denied`);

  // Return cached if available and not forcing regeneration
  if (trip.packingList && !regenerate) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ success: true, packingList: trip.packingList, cached: true }, null, 2) }],
    };
  }

  const result = await generatePackingList(trip.city, trip.days, trip.interests, trip.month);
  trip.packingList = result;
  await trip.save();

  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, packingList: result, cached: false }, null, 2) }],
  };
}

export async function handleSafetyInfo({ tripId, city }, userId) {
  let targetCity = city;
  if (tripId) {
    const trip = await TripPlan.findById(tripId).select('city');
    if (!trip) throw new Error(`Trip ${tripId} not found`);
    targetCity = trip.city;
  }
  if (!targetCity) throw new Error('city or tripId is required');

  const info = await generateSafetyInfo(targetCity);
  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, city: targetCity, ...info }, null, 2) }],
  };
}

export async function handleAddExpense({ tripId, description, amount, category, paidBy, splitAmong }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId });
  if (!trip) throw new Error(`Trip ${tripId} not found or access denied`);

  trip.expenses.push({
    description: description || 'Expense',
    amount,
    category: category || 'Other',
    paidBy: paidBy || userId,
    splitAmong: splitAmong || trip.members.map(m => m.userId.toString()),
    date: new Date(),
  });
  trip.budgetSpent = trip.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  await trip.save();

  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, budgetSpent: trip.budgetSpent, expenseCount: trip.expenses.length }, null, 2) }],
  };
}

export async function handleGetSettlements({ tripId }, userId) {
  const trip = await TripPlan.findById(tripId).populate('members.userId', 'name username').lean();
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const members = trip.members.map(m => ({ id: m.userId._id.toString(), name: m.userId.name }));
  const balances = {};
  members.forEach(m => { balances[m.id] = 0; });

  (trip.expenses || []).forEach(exp => {
    const paidBy = exp.paidBy?.toString() || trip.admin?.toString();
    const splitList = exp.splitAmong?.length ? exp.splitAmong.map(s => s.toString()) : members.map(m => m.id);
    const share = (exp.amount || 0) / splitList.length;
    if (balances[paidBy] !== undefined) balances[paidBy] += exp.amount || 0;
    splitList.forEach(uid => { if (balances[uid] !== undefined) balances[uid] -= share; });
  });

  const creditors = [], debtors = [];
  Object.entries(balances).forEach(([uid, bal]) => {
    const member = members.find(m => m.id === uid);
    if (bal > 0.01) creditors.push({ ...member, amount: bal });
    else if (bal < -0.01) debtors.push({ ...member, amount: Math.abs(bal) });
  });

  const settlements = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    settlements.push({ from: debtors[di].name, fromId: debtors[di].id, to: creditors[ci].name, toId: creditors[ci].id, amount: Math.round(amount * 100) / 100 });
    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;
    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }

  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, settlements, totalExpenses: trip.budgetSpent || 0 }, null, 2) }],
  };
}

export async function handleReviewSummary({ tripId, placeId }, userId) {
  let targetPlace = placeId;
  if (tripId && !placeId) {
    const trip = await TripPlan.findById(tripId).select('city');
    targetPlace = trip?.city || 'destination';
  }
  const reviews = await generatePlaceReviews(targetPlace);
  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, place: targetPlace, reviews }, null, 2) }],
  };
}

export async function handleTripSummary({ tripId }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId }).lean();
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const summary = {
    title: trip.title,
    city: trip.city,
    days: trip.days,
    estimatedCost: trip.estimatedCost,
    budgetSpent: trip.budgetSpent || 0,
    memberCount: trip.members?.length || 1,
    expenseCount: trip.expenses?.length || 0,
    packingCategories: trip.packingList?.categories?.length || 0,
    chatMessages: trip.chatHistory?.length || 0,
    impactTags: trip.impactTags || [],
    scores: trip.scores || {},
    createdAt: trip.createdAt,
  };

  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, summary }, null, 2) }],
  };
}

export async function handleRouteOptimizer({ tripId, day }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId });
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const itinerary = trip.itinerary;
  if (!itinerary?.days) throw new Error('Trip has no itinerary to optimize');

  // Optimize by sorting activities by lat/lng (nearest-neighbor heuristic)
  const daysToOptimize = day
    ? [itinerary.days[day - 1]].filter(Boolean)
    : itinerary.days;

  const optimized = daysToOptimize.map(dayPlan => {
    if (!dayPlan?.activities?.length) return dayPlan;
    const withCoords = dayPlan.activities.filter(a => a.coordinates?.lat);
    const withoutCoords = dayPlan.activities.filter(a => !a.coordinates?.lat);

    // Sort by longitude (crude east-to-west clustering)
    withCoords.sort((a, b) => (a.coordinates?.lng || 0) - (b.coordinates?.lng || 0));

    return { ...dayPlan, activities: [...withCoords, ...withoutCoords], optimized: true };
  });

  if (day) {
    itinerary.days[day - 1] = optimized[0];
  } else {
    itinerary.days = optimized;
  }

  trip.itinerary = itinerary;
  await trip.save();

  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Route optimized', optimizedDays: optimized.length }, null, 2) }],
  };
}
