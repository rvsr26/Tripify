import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-pro-latest"
];

function getModel(modelName) {
  return genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: { responseMimeType: "application/json" }
  });
}

function safeParseJSON(text) {
  const jsonStart = text.indexOf("{");
  const jsonEnd   = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return {};
  try {
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    return {};
  }
}

// ─── Mock Fallbacks (Keeping for safety) ─────────────────────────────────────

const MOCK_OPTIONS = (dest = "Paris") => ({
  destination: dest,
  days: 5,
  month: "October",
  currency: "$",
  travelWith: "friends",
  optionA: {
    name: "Budget Explorer",
    tagline: "Maximum experience, minimum cost",
    highlights: ["Street food tour", "Free museums day", "Public park picnic", "Local market visit"],
    accommodation: "Hostel or Budget Airbnb",
    transport: "Metro & Walking",
    food: "Street food and local spots",
    estimatedCost: 800,
    costBreakdown: { accommodation: 300, food: 200, transport: 100, activities: 100, misc: 100 }
  },
  optionB: {
    name: "Perfect Balance",
    tagline: "Best of both worlds",
    highlights: ["Guided city tour", "Famous landmark entry", "Boutique cafe hopping", "Evening boat cruise"],
    accommodation: "3-star Boutique Hotel",
    transport: "Uber & Metro mix",
    food: "Local bistros and cafes",
    estimatedCost: 1400,
    costBreakdown: { accommodation: 600, food: 350, transport: 150, activities: 200, misc: 100 }
  },
  optionC: {
    name: "Luxury Escape",
    tagline: "Premium experience, no compromises",
    highlights: ["Private guide", "Michelin-star dining", "Luxury spa day", "VIP skip-the-line access"],
    accommodation: "5-star Luxury Suite",
    transport: "Private chauffeur",
    food: "Fine dining and rooftops",
    estimatedCost: 2800,
    costBreakdown: { accommodation: 1500, food: 600, transport: 300, activities: 300, misc: 100 }
  }
});

const MOCK_ITINERARY = (dest, days, option) => ({
  days: Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Exploring the Heart of ${dest}`,
    activities: [
      { time: "9:00 AM", activity: "Breakfast at Local Cafe", description: "Start the day with fresh local pastries and coffee.", cost: 15, location: "Downtown Cafe" },
      { time: "11:00 AM", activity: "Main Landmark Visit", description: "Visit the most iconic spot in the city.", cost: 30, location: "City Center" },
      { time: "1:30 PM", activity: "Traditional Lunch", description: "Enjoy a mid-day meal featuring local specialties.", cost: 25, location: "Old Town Bistro" },
      { time: "4:00 PM", activity: "Evening Stroll & Shopping", description: "Explore local boutiques and scenic streets.", cost: 0, location: "Main Boulevard" },
      { time: "8:00 PM", activity: "Dinner with a View", description: "A beautiful dinner to wrap up the day.", cost: 45, location: "Riverside Restaurant" }
    ]
  })),
  tips: ["Carry a reusable water bottle", "Use public transport for best value", "Book tickets in advance", "Learn basic local greetings", "Keep a digital copy of your passport"],
  totalCost: (option.estimatedCost || 1000)
});

// ─── Gemini API Wrapper ───────────────────────────────────────────────────────

async function callGemini(prompt, fallbackData) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    let lastError = null;
    for (const modelName of MODELS) {
      try {
        console.log(`🤖 Attempting Gemini with model: ${modelName}...`);
        const model = getModel(modelName);
        const result = await model.generateContent(prompt);
        const text   = result.response.text();
        const parsed = safeParseJSON(text);
        if (Object.keys(parsed).length === 0) throw new Error("Empty AI response");
        console.log(`✅ Success with model: ${modelName}`);
        return { ...parsed, isMock: false };
      } catch (err) {
        lastError = err;
        console.warn(`❌ Model ${modelName} failed: ${err.message}`);
        continue;
      }
    }
    
    throw lastError || new Error("All models failed");
  } catch (err) {
    console.error("⚠️ All Gemini Models Failed:", err.message);
    return { ...fallbackData, isMock: true };
  }
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export async function generateTripOptions(naturalPrompt) {
  const dest = naturalPrompt.split('to')?.[1]?.trim()?.split(' ')?.[0] || "Destination";
  const fallback = MOCK_OPTIONS(dest);

  const system = `You are an expert travel planner. Analyze a natural language trip request and generate 3 plan options (Budget, Balanced, Luxury). Return valid JSON.`;
  const userPrompt = `User request: "${naturalPrompt}". Generate 3 plan options in JSON following this structure: { destination, days, month, currency, travelWith, optionA, optionB, optionC }.`;
  
  return await callGemini(`${system}\n\n${userPrompt}`, fallback);
}

export async function generateFullItinerary(optionData, naturalPrompt, parsedData) {
  const dest = parsedData.destination || "the destination";
  const days = parsedData.days || 3;
  const fallback = MOCK_ITINERARY(dest, days, optionData);

  const system     = `You are an expert travel planner. Generate a detailed, realistic day-by-day itinerary. Return valid JSON strictly matching the instructed schema without any markdown formatting wrappers.`;
  const userPrompt = `Create a ${days}-day itinerary for ${dest} with plan ${optionData.name} based on this request: "${naturalPrompt}".

REQUIRED JSON SCHEMA:
{
  "days": [
    {
      "day": 1,
      "title": "Title of the day",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Name of the activity",
          "description": "Short description of what to do",
          "cost": 15,
          "location": "Name of the location or landmark",
          "coordinates": {
            "lat": 48.8584,
            "lng": 2.2945
          }
        }
      ]
    }
  ],
  "tips": ["Travel tip 1", "Travel tip 2"],
  "totalCost": ${optionData.estimatedCost || 1000},
  "budgetBreakdown": {
    "food": 250,
    "transport": 100,
    "accommodation": 400,
    "activities": 200,
    "misc": 50
  },
  "packingList": {
    "categories": [
      {
        "name": "Essentials",
        "icon": "🎒",
        "items": ["Item 1", "Item 2"]
      }
    ]
  },
  "bookingOptions": [
    {
      "type": "flight|hotel|taxi|activity",
      "provider": "Skyscanner",
      "link": "https://www.skyscanner.com/transport/flights/",
      "description": "Find the best flights",
      "priceHint": "From $150"
    }
  ]
}

Ensure you provide activities for all ${days} days, realistic estimated costs, locations, accurate coordinates, descriptions, a logical budgetBreakdown, a comprehensive categorized packingList, and dynamic redirect bookingOptions for flights/transport and hotels customized for ${dest}.`;

  return await callGemini(`${system}\n\n${userPrompt}`, fallback);
}

export async function planTrip(prompt = "Plan a trip", prefs = {}) {
  const system     = `You are an expert travel planner. Generate a trip plan JSON.`;
  return await callGemini(`${system}\n\n${prompt}`, { error: "AI_ERROR", isMock: true });
}

export async function chatModifyTrip(currentItinerary, userMessage, tripContext) {
  const system = `You are a helpful AI travel assistant. The user wants to modify their existing trip itinerary. Make requested changes and return the COMPLETE updated itinerary JSON with an "aiMessage" explanation.`;
  const userPrompt = `Trip: "${tripContext.title}" to ${tripContext.city}. User request: "${userMessage}". Current itinerary: ${JSON.stringify(currentItinerary)}`;

  const result = await callGemini(`${system}\n\n${userPrompt}`, { isMock: true });
  if (result.isMock) {
    return { ...currentItinerary, aiMessage: "Gemini is currently unavailable. No changes made.", isMock: true };
  }
  return result;
}

export async function generatePlaceReviews(placeId) {
  const prompt = `Generate 3 realistic Google Maps user reviews for the place/attraction named "${placeId}".
Return ONLY a valid JSON object with a 'reviews' array. Each review should have:
- 'author' (a randomly generated generic first name like 'Sarah' or 'Michael M.')
- 'rating' (integer 4 or 5)
- 'text' (a realistic 2-3 sentence review)
- 'date' (a random recent date in ISO format)`;

  const fallback = {
    reviews: [
      { author: 'Jane D.', rating: 5, text: 'Absolutely breathtaking! Highly recommend visiting early in the morning to beat the crowds.', date: new Date().toISOString() },
      { author: 'Mark S.', rating: 4, text: 'Great experience overall. It was quite busy, but the views definitely made it worthwhile.', date: new Date().toISOString() },
      { author: 'Emma L.', rating: 5, text: 'A must-see attraction! We spent hours here and it was the highlight of our trip.', date: new Date().toISOString() }
    ]
  };

  try {
    const res = await callGemini(prompt, fallback);
    return res.reviews || fallback.reviews;
  } catch (e) {
    return fallback.reviews;
  }
}

export async function generatePackingList(city, days, interests, month) {
  const fallback = {
    categories: [
      { name: "Essentials", icon: "📄", items: ["Passport", "Wallet", "Phone", "Charger"] }
    ],
    isMock: true
  };
  const system     = `You are a travel packing expert. Generate a smart, destination-specific packing list JSON.
REQUIRED JSON SCHEMA:
{
  "categories": [
    {
      "name": "Essentials",
      "icon": "🎒",
      "items": ["Item 1", "Item 2"]
    }
  ]
}
Ensure exactly this format with valid string arrays for items.`;
  const userPrompt = `Packing list for ${city} during ${month} for ${days} days. Interests: ${interests?.join(", ")}`;

  return await callGemini(`${system}\n\n${userPrompt}`, fallback);
}

// ─── AI Safety Information Generator ──────────────────────────────────────────

export async function generateSafetyInfo(city) {
  const fallback = {
    safetyScore: 8,
    emergencyNumbers: {
      police: "911",
      ambulance: "911",
      fire: "911"
    },
    advisories: ["Be aware of pickpockets in crowded tourist areas.", "Stay hydrated during summer months."],
    embassyInfo: "Check local listings for your country's embassy.",
    isMock: true
  };

  const system = `You are a travel safety and advisory expert. For a given destination city, provide accurate emergency numbers, a general safety score (1-10, where 10 is very safe), and 2-3 practical safety advisories. Return valid JSON strictly matching the instructed schema without any markdown formatting wrappers.`;

  const userPrompt = `Provide safety info for ${city}.
REQUIRED JSON SCHEMA:
{
  "safetyScore": 8,
  "emergencyNumbers": {
    "police": "112",
    "ambulance": "112",
    "fire": "112"
  },
  "advisories": ["Advisory 1", "Advisory 2"],
  "embassyInfo": "General advice on locating embassies"
}`;

  return await callGemini(`${system}\n\n${userPrompt}`, fallback);
}

// ─── AI Travel Personality Quiz ───────────────────────────────────────────────

export async function generateTravelPersonality(answers) {
  const fallback = {
    type: "The Adventurer",
    emoji: "🏔️",
    tagline: "You live for the thrill of the unknown",
    description: "You're happiest when you're off the beaten path, discovering hidden gems and pushing your comfort zone. Mountains, jungles, or remote islands — the wilder, the better.",
    traits: ["Adventurous", "Spontaneous", "Resilient", "Curious"],
    idealDestinations: ["Nepal", "Patagonia", "Iceland", "New Zealand"],
    travelTip: "Always pack a portable charger and an open mind — you never know where the road will take you.",
    color: "#f43f5e",
    isMock: true
  };

  const system = `You are a fun, insightful travel personality analyst. Based on quiz answers, determine the user's travel personality type and return a rich, shareable profile. Be creative, enthusiastic, and specific. Return valid JSON.`;

  const userPrompt = `Based on these travel quiz answers, determine my travel personality:
${JSON.stringify(answers)}

Return JSON with this EXACT structure:
{
  "type": "The [Personality Name]",
  "emoji": "single emoji",
  "tagline": "A catchy one-liner (max 10 words)",
  "description": "2-3 sentences describing this personality type",
  "traits": ["trait1", "trait2", "trait3", "trait4"],
  "idealDestinations": ["City1", "City2", "City3", "City4"],
  "travelTip": "One personalized travel tip",
  "color": "#hex color that represents this personality"
}`;

  return await callGemini(`${system}\n\n${userPrompt}`, fallback);
}

// ─── AI General Travel Chatbot ────────────────────────────────────────────────

export async function travelChatbot(message, context = {}) {
  const fallback = {
    reply: "I'm having trouble connecting right now. Try asking me again in a moment!",
    isMock: true
  };

  const system = `You are Tripify AI — a friendly, knowledgeable travel assistant. Answer travel questions helpfully and concisely. If asked about a specific destination, provide insider tips, budget estimates, and practical advice. Keep responses under 150 words. Return valid JSON with a "reply" field.`;

  const contextStr = context.city ? `The user is currently planning a trip to ${context.city} for ${context.days} days.` : '';

  const userPrompt = `${contextStr}\nUser question: "${message}"\n\nReturn JSON: { "reply": "your helpful response" }`;

  return await callGemini(`${system}\n\n${userPrompt}`, fallback);
}

// ─── AI Story Caption Generator ───────────────────────────────────────────────

export async function generateStoryCaptions(tripTitle, city, highlights) {
  const fallback = {
    captions: highlights.map((h, i) => `Day ${i + 1} in ${city} — ${h}`),
    isMock: true
  };

  const system = `You are a creative travel storyteller. Generate Instagram-worthy captions for trip story slides. Be poetic, engaging, and use relevant emojis. Return valid JSON.`;
  const userPrompt = `Trip: "${tripTitle}" in ${city}. Generate captions for these moments: ${JSON.stringify(highlights)}. Return JSON: { "captions": ["caption1", "caption2", ...] }`;

  return await callGemini(`${system}\n\n${userPrompt}`, fallback);
}

