/**
 * MCP Social & Collaboration Tools
 * Wraps existing communities, friends, stories, journal, and trip collaboration features.
 */
import { z } from 'zod';
import TripPlan from '../../models/TripPlan.js';
import Community from '../../models/Community.js';
import Story from '../../models/Story.js';
import Journal from '../../models/Journal.js';
import User from '../../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { generateStoryCaptions } from '../../services/aiService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const CommunityPostSchema = {
  communityId: z.string(),
  content:     z.string().min(1).max(2000),
};

export const JournalSummarySchema = {
  tripId: z.string(),
};

export const AddJournalEntrySchema = {
  tripId:    z.string(),
  title:     z.string().optional(),
  content:   z.string().min(1),
  mood:      z.enum(['happy', 'excited', 'tired', 'sad', 'neutral']).optional().default('happy'),
  location:  z.string().optional(),
  dayNumber: z.number().int().positive().optional(),
};

export const StoryGeneratorSchema = {
  tripId:     z.string(),
  highlights: z.array(z.string()).optional().describe('Key moments to caption'),
};

export const FriendMatchSchema = {};

export const JoinTripSchema = {
  token: z.string().describe('Invite token from the trip link'),
};

export const TripReplannerSchema = {
  tripId:      z.string(),
  constraint:  z.string().describe('What changed, e.g. "We lost Day 2 because of a flight delay"'),
};

// ─── Handlers ────────────────────────────────────────────────────────────────

export async function handleCommunityPost({ communityId, content }, userId) {
  const community = await Community.findById(communityId);
  if (!community) throw new Error(`Community ${communityId} not found`);

  const isMember = community.members?.some(m => m.toString() === userId);
  if (!isMember) throw new Error('You must be a member to post');

  community.posts = community.posts || [];
  community.posts.push({
    authorId: userId,
    content,
    likes: [],
    createdAt: new Date(),
  });
  await community.save();

  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, communityId, postCount: community.posts.length }, null, 2) }],
  };
}

export async function handleJournalSummary({ tripId }, userId) {
  const journal = await Journal.findOne({ userId, tripId }).lean();
  if (!journal || !journal.entries?.length) {
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, summary: 'No journal entries yet.', entries: 0 }, null, 2) }] };
  }

  const entryTexts = journal.entries.map((e, i) => `Day ${e.dayNumber || i + 1} [${e.mood || 'happy'}]: ${e.content}`).join('\n\n');

  const prompt = `Summarize this travel journal into a beautiful 3-paragraph travel memoir:\n\n${entryTexts}\n\nReturn JSON: { "summary": string, "highlights": [string], "mood": string }`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, entries: journal.entries.length, ...parsed }, null, 2),
      }],
    };
  } catch {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, entries: journal.entries.length, summary: entryTexts.slice(0, 300) }, null, 2),
      }],
    };
  }
}

export async function handleAddJournalEntry({ tripId, title, content, mood, location, dayNumber }, userId) {
  let journal = await Journal.findOne({ userId, tripId });
  if (!journal) journal = await Journal.create({ userId, tripId, entries: [] });

  journal.entries.push({ title, content, mood: mood || 'happy', location, dayNumber });
  await journal.save();

  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, entries: journal.entries.length }, null, 2) }],
  };
}

export async function handleStoryGenerator({ tripId, highlights }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId }).lean();
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const defaultHighlights = highlights || (trip.itinerary?.days || []).slice(0, 5).map(d => d.title || `Day ${d.day}`);

  const result = await generateStoryCaptions(trip.title, trip.city, defaultHighlights);

  // Auto-create the story document
  const story = await Story.create({
    userId,
    tripId,
    title: `${trip.title} — My Story`,
    slides: (result.captions || defaultHighlights).map((caption, i) => ({
      caption: caption || defaultHighlights[i] || `Day ${i + 1}`,
      location: trip.city || '',
    })),
    isPublic: false,
  });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ success: true, storyId: story._id, captions: result.captions, tripId }, null, 2),
    }],
  };
}

export async function handleFriendMatch({}, userId) {
  const user = await User.findById(userId).lean();
  const myTrips = await TripPlan.find({ 'members.userId': userId }).lean();
  const myInterests = user?.preferences || [];
  const myCities = [...new Set(myTrips.map(t => t.city).filter(Boolean))];

  const allUsers = await User.find({ _id: { $ne: userId } })
    .select('name username bio preferences createdAt')
    .limit(50)
    .lean();

  const candidates = await Promise.all(allUsers.map(async u => {
    const theirTrips = await TripPlan.find({ 'members.userId': u._id }).select('city days').lean();
    const theirCities = [...new Set(theirTrips.map(t => t.city).filter(Boolean))];
    const theirInterests = u.preferences || [];
    const sharedInterests = myInterests.filter(i => theirInterests.includes(i));
    const sharedCities = myCities.filter(c => theirCities.includes(c));
    const score = (sharedInterests.length * 20) + (sharedCities.length * 15) + (theirTrips.length * 5);
    return { _id: u._id, name: u.name, username: u.username, bio: u.bio, tripCount: theirTrips.length, sharedInterests, sharedCities, compatibility: Math.min(100, score) };
  }));

  candidates.sort((a, b) => b.compatibility - a.compatibility);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ success: true, candidates: candidates.slice(0, 10) }, null, 2),
    }],
  };
}

export async function handleJoinTrip({ token }, userId) {
  const trip = await TripPlan.findOne({ inviteToken: token });
  if (!trip) throw new Error('Invalid invite token');

  const isMember = trip.members.some(m => m.userId.toString() === userId);
  if (isMember) return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Already a member', tripId: trip._id }, null, 2) }] };

  if (trip.members.length >= trip.maxMembers) throw new Error('Trip is full');

  trip.members.push({ userId, role: 'member' });
  await trip.save();

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ success: true, message: 'Joined trip successfully', tripId: trip._id, title: trip.title }, null, 2),
    }],
  };
}

export async function handleTripReplanner({ tripId, constraint }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId });
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const prompt = `A traveller's trip to ${trip.city} has a constraint: "${constraint}".
Original itinerary (first 2 days): ${JSON.stringify(trip.itinerary?.days?.slice(0, 2))}.
Replan the affected portion. Return JSON: { "message": string, "affectedDays": number[], "suggestions": [string], "revisedDayTitles": [string] }`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, tripId, constraint, ...parsed }, null, 2),
      }],
    };
  } catch (err) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: false, error: err.message }, null, 2),
      }],
    };
  }
}
