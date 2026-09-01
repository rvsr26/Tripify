/**
 * Tripify MCP Server
 * Central registration of all tools, resources, and prompts.
 * Transport setup (StreamableHTTP + SSE fallback) is in transport.js.
 *
 * Architecture: One McpServer instance shared across all sessions.
 * Each request gets its own userId via the auth layer.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// ── Tool modules (thin wrappers over existing services) ───────────────────────
import {
  GenerateTripOptionsSchema, SelectPlanSchema, ModifyTripSchema,
  PackingListSchema, SafetyInfoSchema, AddExpenseSchema, GetSettlementsSchema,
  ReviewSummarySchema, TripSummarySchema, RoutOptimizerSchema,
  handleGenerateTripOptions, handleSelectPlan, handleModifyTrip,
  handlePackingList, handleSafetyInfo, handleAddExpense, handleGetSettlements,
  handleReviewSummary, handleTripSummary, handleRouteOptimizer,
} from './tools/planner.tools.js';

import {
  WeatherSchema, TravelStatsSchema, BudgetOptimizerSchema,
  PersonalityQuizSchema, ChatbotSchema, DestinationEventsSchema, VoiceToTripSchema,
  handleWeather, handleTravelStats, handleBudgetOptimizer,
  handlePersonalityQuiz, handleChatbot, handleDestinationEvents, handleVoiceToTrip,
} from './tools/intelligence.tools.js';

import {
  CommunityPostSchema, JournalSummarySchema, AddJournalEntrySchema,
  StoryGeneratorSchema, FriendMatchSchema, JoinTripSchema, TripReplannerSchema,
  handleCommunityPost, handleJournalSummary, handleAddJournalEntry,
  handleStoryGenerator, handleFriendMatch, handleJoinTrip, handleTripReplanner,
} from './tools/social.tools.js';

import { registerResources } from './resources/index.js';
import { registerPrompts }   from './prompts/index.js';

// ─── Emergency Tool (inline — small enough to not need its own file) ──────────
import { GoogleGenerativeAI } from '@google/generative-ai';
import TripPlan from '../models/TripPlan.js';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function handleEmergencyReplanner({ tripId, disruption, location }, userId) {
  const trip = await TripPlan.findOne({ _id: tripId, 'members.userId': userId }).lean();
  if (!trip) throw new Error(`Trip ${tripId} not found or access denied`);

  // Gather context from multiple sources in parallel
  const [weatherRes] = await Promise.allSettled([
    axios.get(`https://wttr.in/${encodeURIComponent(trip.city)}?format=j1`, { timeout: 4000 }),
  ]);
  const weather = weatherRes.status === 'fulfilled' ? weatherRes.value.data?.current_condition?.[0] : null;

  const prompt = `You are Tripify's emergency travel coordinator. A traveller in ${location || trip.city} has experienced: "${disruption}".

Trip context:
- Destination: ${trip.city}
- Days: ${trip.days}
- Budget remaining: ${Math.max(0, (trip.estimatedCost || 0) - (trip.budgetSpent || 0))} ${trip.currency || 'USD'}
- Members: ${trip.members?.length || 1} travellers
- Current weather: ${weather ? `${weather.temp_C}°C, ${weather.weatherDesc?.[0]?.value}` : 'unknown'}

Provide a concrete emergency recovery plan. Be specific and calm.
Return JSON: {
  "severity": "low|medium|high|critical",
  "message": string,
  "immediateActions": [{ "action": string, "phoneNumber": string, "link": string }],
  "recoveryPlan": [{ "action": string, "priority": "immediate|today|optional", "estimatedCost": number }],
  "alternativeFlights": [{ "description": string, "link": string }],
  "nearbyHotels": [{ "description": string, "link": string }],
  "insuranceTip": string,
  "totalExtraCost": number
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, tripId, disruption, ...parsed }, null, 2),
      }],
    };
  } catch (err) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: err.message,
          immediateActions: [
            { action: 'Contact your airline immediately', phoneNumber: '1-800-AIRLINE', link: 'https://www.skyscanner.com' },
            { action: 'Contact travel insurance provider', link: 'https://www.worldnomads.com' },
            { action: `Contact local embassy in ${trip.city}`, link: 'https://www.embassyworld.com' },
          ],
        }, null, 2),
      }],
    };
  }
}

// ─── Server Factory ───────────────────────────────────────────────────────────

/**
 * Creates and configures the Tripify MCP Server.
 * Call once at startup; the instance is reused for all sessions.
 */
export function createMcpServer() {
  const server = new McpServer({
    name:    'tripify-enterprise',
    version: '1.0.0',
  });

  // ── Register Resources ─────────────────────────────────────────────────────
  registerResources(server);

  // ── Register Prompts ───────────────────────────────────────────────────────
  registerPrompts(server);

  // ════════════════════════════════════════════════════════════════════════════
  // PLANNER TOOLS
  // ════════════════════════════════════════════════════════════════════════════

  server.tool(
    'generate_trip_options',
    'Analyze a natural language trip request and return 3 plan options: Budget, Balanced, and Luxury. Call this FIRST before select_plan.',
    GenerateTripOptionsSchema,
    async (params, { userId }) => handleGenerateTripOptions(params, userId),
  );

  server.tool(
    'select_plan',
    'Confirm a plan option (A/B/C) and generate a full day-by-day itinerary saved to the database. Requires generate_trip_options to have been called first.',
    SelectPlanSchema,
    async (params, { userId }) => handleSelectPlan(params, userId),
  );

  server.tool(
    'modify_trip',
    'Modify an existing trip itinerary using a natural language instruction. Use for changes like "Add a cooking class on Day 3" or "Make Day 2 cheaper".',
    ModifyTripSchema,
    async (params, { userId }) => handleModifyTrip(params, userId),
  );

  server.tool(
    'get_packing_list',
    'Get or regenerate a destination-aware, AI-generated packing checklist for a trip.',
    PackingListSchema,
    async (params, { userId }) => handlePackingList(params, userId),
  );

  server.tool(
    'get_safety_info',
    'Get AI-generated safety score, emergency numbers, and travel advisories for a destination.',
    SafetyInfoSchema,
    async (params, { userId }) => handleSafetyInfo(params, userId),
  );

  server.tool(
    'add_expense',
    'Add an expense to a group trip and update the split calculation.',
    AddExpenseSchema,
    async (params, { userId }) => handleAddExpense(params, userId),
  );

  server.tool(
    'get_settlements',
    'Calculate the minimum set of payments to settle all group expenses (who owes whom).',
    GetSettlementsSchema,
    async (params, { userId }) => handleGetSettlements(params, userId),
  );

  server.tool(
    'get_review_summary',
    'Get AI-generated or user reviews summarized for a destination or specific place.',
    ReviewSummarySchema,
    async (params, { userId }) => handleReviewSummary(params, userId),
  );

  server.tool(
    'get_trip_summary',
    'Get a high-level summary of a trip including stats, expenses, packing status, and impact scores.',
    TripSummarySchema,
    async (params, { userId }) => handleTripSummary(params, userId),
  );

  server.tool(
    'optimize_route',
    'Reorder activities in one or all days to minimize travel time and distance.',
    RoutOptimizerSchema,
    async (params, { userId }) => handleRouteOptimizer(params, userId),
  );

  // ════════════════════════════════════════════════════════════════════════════
  // INTELLIGENCE TOOLS
  // ════════════════════════════════════════════════════════════════════════════

  server.tool(
    'get_weather',
    'Get current weather and 5-day forecast for any city.',
    WeatherSchema,
    async (params) => handleWeather(params),
  );

  server.tool(
    'get_travel_stats',
    "Get the authenticated user's travel statistics: cities, countries, days, badges, tier, XP, and sustainability scores.",
    TravelStatsSchema,
    async (params, { userId }) => handleTravelStats(params, userId),
  );

  server.tool(
    'optimize_budget',
    'Analyze a trip budget and get AI-powered suggestions for cost reduction.',
    BudgetOptimizerSchema,
    async (params, { userId }) => handleBudgetOptimizer(params, userId),
  );

  server.tool(
    'submit_personality_quiz',
    'Submit travel quiz answers and receive an AI-generated travel personality profile.',
    PersonalityQuizSchema,
    async (params, { userId }) => handlePersonalityQuiz(params, userId),
  );

  server.tool(
    'chat_with_tripify',
    'Send a message to the Tripify AI travel chatbot. Optionally provide trip context (city, days) for more relevant answers.',
    ChatbotSchema,
    async (params, { userId }) => handleChatbot(params, userId),
  );

  server.tool(
    'get_destination_events',
    'Get local events, festivals, and seasonal highlights for a destination during a specific period.',
    DestinationEventsSchema,
    async (params) => handleDestinationEvents(params),
  );

  server.tool(
    'voice_to_trip',
    'Parse a voice transcript into structured trip parameters ready for generate_trip_options.',
    VoiceToTripSchema,
    async (params) => handleVoiceToTrip(params),
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SOCIAL & COLLABORATION TOOLS
  // ════════════════════════════════════════════════════════════════════════════

  server.tool(
    'create_community_post',
    'Create a new post in a travel community/tribe.',
    CommunityPostSchema,
    async (params, { userId }) => handleCommunityPost(params, userId),
  );

  server.tool(
    'get_journal_summary',
    'Get an AI-generated narrative summary of all journal entries for a trip.',
    JournalSummarySchema,
    async (params, { userId }) => handleJournalSummary(params, userId),
  );

  server.tool(
    'add_journal_entry',
    'Add a journal entry to a trip (mood, content, location, photos).',
    AddJournalEntrySchema,
    async (params, { userId }) => handleAddJournalEntry(params, userId),
  );

  server.tool(
    'generate_trip_story',
    'Generate an Instagram-style trip story with AI captions from the trip highlights.',
    StoryGeneratorSchema,
    async (params, { userId }) => handleStoryGenerator(params, userId),
  );

  server.tool(
    'find_travel_matches',
    'Find compatible travel buddies based on shared interests, destinations, and travel history.',
    FriendMatchSchema,
    async (params, { userId }) => handleFriendMatch(params, userId),
  );

  server.tool(
    'join_trip',
    'Join a collaborative trip using an invite token from a trip link.',
    JoinTripSchema,
    async (params, { userId }) => handleJoinTrip(params, userId),
  );

  server.tool(
    'replan_trip',
    'Replan a trip itinerary when a constraint changes (e.g. lost a day, budget cut, weather change).',
    TripReplannerSchema,
    async (params, { userId }) => handleTripReplanner(params, userId),
  );

  // ════════════════════════════════════════════════════════════════════════════
  // EMERGENCY TOOL
  // ════════════════════════════════════════════════════════════════════════════

  server.tool(
    'emergency_replan',
    'EMERGENCY: Triggered when a serious travel disruption occurs (flight cancelled, hotel unavailable, medical emergency, lost passport). Provides immediate action plan.',
    {
      tripId:     z.string(),
      disruption: z.string().describe('Description of what went wrong'),
      location:   z.string().optional().describe('Current location of the traveller'),
    },
    async (params, { userId }) => handleEmergencyReplanner(params, userId),
  );

  console.log('✅ Tripify MCP Server configured with 23 tools, 5 resources, 5 prompts');
  return server;
}
