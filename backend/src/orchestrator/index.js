/**
 * AI Orchestrator — Autonomous AI Travel Operating System
 * Frontier-grade multi-agent orchestration engine.
 *
 * Pipeline:
 *   1. User Memory Graph & Travel Knowledge Graph Lookup
 *   2. Pre-computed Execution DAG Generation
 *   3. Hierarchical Agent Debate & Disagreement Resolution
 *   4. Tree of Thoughts (ToT) Candidate Evaluation
 *   5. Parallel Tool Execution via MCP Tool Handlers
 *   6. Digital Twin Traveler Pacing & Stress-Test Simulation
 *   7. Critic Agent Self-Reflection & Quality Evaluation Pass
 *   8. SSE Progress Streaming & State Telemetry
 */
import {
  handleGenerateTripOptions,
  handleSelectPlan,
  handlePackingList,
  handleSafetyInfo,
} from '../mcp/tools/planner.tools.js';

import {
  handleWeather,
  handleBudgetOptimizer,
  handleDestinationEvents,
  handleVoiceToTrip,
} from '../mcp/tools/intelligence.tools.js';

import { getUserMemoryGraph, queryKnowledgeGraph } from './memoryGraph.js';
import { HierarchicalAgentSystem }                from './hierarchical.js';
import { DigitalTwinSimulator }                  from './simulation.js';
import { ReflectionEngine }                       from './reflection.js';
import { ExecutionDAGPlanner }                    from './dagPlanner.js';

// ─── Context ──────────────────────────────────────────────────────────────────

class OrchestratorContext {
  constructor(userId) {
    this.userId     = userId;
    this.startedAt  = Date.now();
    this.agentLog   = [];
    this.results    = {};
    this.tripId     = null;
    this.city       = null;
    this.dag        = null;
    this.memory     = null;
    this.simulation = null;
    this.reflection = null;
  }

  record(agent, status, data) {
    this.agentLog.push({ agent, status, ts: Date.now() - this.startedAt });
    if (data) this.results[agent] = data;
  }

  toSummary() {
    return {
      elapsed:    Date.now() - this.startedAt,
      agents:     this.agentLog,
      tripId:     this.tripId,
      results:    this.results,
      dag:        this.dag,
      memory:     this.memory,
      simulation: this.simulation,
      reflection: this.reflection,
    };
  }
}

// ─── Agent Runner ─────────────────────────────────────────────────────────────

async function runAgent(name, fn, ctx, emit) {
  emit({ type: 'agent_start', agent: name });
  try {
    const result = await fn(ctx);
    ctx.record(name, 'success', result);
    emit({ type: 'agent_done', agent: name, result });
    return result;
  } catch (err) {
    ctx.record(name, 'error', { error: err.message });
    emit({ type: 'agent_error', agent: name, error: err.message });
    return null; // non-fatal — orchestrator continues
  }
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export async function orchestrateTripPlan({ prompt, optionKey, optionData, parsedData, userId, emit }) {
  const ctx = new OrchestratorContext(userId);
  emit({ type: 'start', message: '🚀 Autonomous AI OS Orchestrator started', prompt });

  const dagPlanner = new ExecutionDAGPlanner();
  const reflectionEngine = new ReflectionEngine();

  // ── Step 1: Memory Graph & Pre-computed Execution DAG ──────────────────────
  ctx.memory = await runAgent('memory_graph', async () => {
    emit({ type: 'progress', message: '🧠 Querying User Memory Graph & Travel History...' });
    return await getUserMemoryGraph(userId);
  }, ctx, emit);

  // Generate Execution DAG
  ctx.dag = dagPlanner.createExecutionDAG(prompt, parsedData?.destination || 'Destination');
  emit({ type: 'dag_ready', dag: ctx.dag });

  // ── Step 2: Generate 3 options (Option phase) ──────────────────────────────
  let options = null;
  if (!optionData) {
    options = await runAgent('planner', async () => {
      emit({ type: 'progress', message: '✨ Tree-of-Thoughts: Evaluating 3 candidate plan paths...' });
      const res = await handleGenerateTripOptions({ prompt }, userId);
      const data = JSON.parse(res.content[0].text);
      ctx.city = data.options?.destination;
      return data.options;
    }, ctx, emit);

    if (!options) {
      emit({ type: 'error', message: 'Failed to generate trip options' });
      return ctx;
    }

    // Run Hierarchical Agent Debate preview
    const hierarchy = new HierarchicalAgentSystem(userId, emit);
    await hierarchy.runAgentDebate(prompt, options.destination || 'Destination', options.days || 5, options.optionB?.estimatedCost);

    emit({ type: 'options_ready', options, memory: ctx.memory });
    return ctx;
  }

  // ── Step 3: Full Itinerary Generation & Parallel Tools ───────────────
  if (optionData && parsedData) {
    ctx.city = parsedData.destination;

    const planResult = await runAgent('itinerary', async () => {
      emit({ type: 'progress', message: `📋 Building ${parsedData.days}-day ${optionData.name} itinerary in ${parsedData.destination}...` });
      const res = await handleSelectPlan({ optionKey, optionData, parsedData, naturalPrompt: prompt }, userId);
      const data = JSON.parse(res.content[0].text);
      ctx.tripId = data.tripId || data.plan?._id?.toString();
      return data;
    }, ctx, emit);

    if (!planResult) {
      emit({ type: 'error', message: 'Failed to generate itinerary' });
      return ctx;
    }

    const fullItinerary = planResult.plan?.itinerary || {};

    // ── Step 4: Parallel Tool Execution Layer ──────────────────────────────
    emit({ type: 'progress', message: '🔄 Parallel Execution Layer: Querying weather, safety, packing, budget & events...' });

    const enrichmentAgents = [
      runAgent('weather', async () => {
        emit({ type: 'progress', message: `⛅ Fetching weather forecast for ${ctx.city}...` });
        const res = await handleWeather({ city: ctx.city });
        return JSON.parse(res.content[0].text);
      }, ctx, emit),

      runAgent('safety', async () => {
        emit({ type: 'progress', message: `🛡️ Checking safety score & advisories for ${ctx.city}...` });
        const res = await handleSafetyInfo({ city: ctx.city }, userId);
        return JSON.parse(res.content[0].text);
      }, ctx, emit),

      runAgent('packing', async () => {
        emit({ type: 'progress', message: '🧳 Generating smart categorized packing list...' });
        const res = await handlePackingList({ tripId: ctx.tripId, regenerate: false }, userId);
        return JSON.parse(res.content[0].text);
      }, ctx, emit),

      runAgent('budget', async () => {
        emit({ type: 'progress', message: '💰 Optimising cost allocations...' });
        const res = await handleBudgetOptimizer({ tripId: ctx.tripId, targetBudget: parsedData.budget }, userId);
        return JSON.parse(res.content[0].text);
      }, ctx, emit),

      runAgent('events', async () => {
        emit({ type: 'progress', message: `🎭 Finding local events in ${ctx.city}...` });
        const res = await handleDestinationEvents({
          city:      ctx.city,
          month:     parsedData.month,
          interests: parsedData.interests,
        });
        return JSON.parse(res.content[0].text);
      }, ctx, emit),
    ];

    await Promise.allSettled(enrichmentAgents);

    // ── Step 5: Digital Twin Traveler Simulation ───────────────────────────
    ctx.simulation = await runAgent('digital_twin', async () => {
      emit({ type: 'progress', message: '🏃 Running Digital Twin simulation (walking fatigue & queue stress testing)...' });
      const simulator = new DigitalTwinSimulator(ctx.memory);
      return simulator.simulateTrip(fullItinerary, ctx.city, 'Clear');
    }, ctx, emit);

    // ── Step 6: Critic Agent Self-Reflection Pass ──────────────────────────
    ctx.reflection = await runAgent('critic_reflection', async () => {
      emit({ type: 'progress', message: '🔍 Critic Agent Pass: Evaluating quality, safety, and carbon scores...' });
      return await reflectionEngine.evaluateItinerary(fullItinerary, prompt, ctx.city);
    }, ctx, emit);

    emit({
      type: 'done',
      message: '✅ Autonomous AI OS: Trip optimization complete!',
      summary: ctx.toSummary(),
    });
  }

  return ctx;
}

/**
 * Emergency re-planning orchestration.
 */
export async function orchestrateEmergency({ tripId, disruption, location, userId, emit }) {
  const ctx = new OrchestratorContext(userId);
  emit({ type: 'start', message: '🚨 Emergency Autonomous Recovery Agent activated', disruption });

  await Promise.allSettled([
    runAgent('emergency_plan', async () => {
      emit({ type: 'progress', message: '🆘 Generating emergency recovery plan...' });
      const { default: TripPlan } = await import('../models/TripPlan.js');
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const trip = await TripPlan.findById(tripId).lean();
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const prompt = `Emergency trip recovery for ${trip?.city || 'destination'}. Disruption: "${disruption}". Location: ${location || trip?.city}.
Return JSON: { "severity": string, "message": string, "immediateActions": [{ "action": string, "link": string }], "recoveryPlan": [{ "action": string, "priority": string, "estimatedCost": number }], "urgentActions": [string], "totalExtraCost": number }`;
      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    }, ctx, emit),

    runAgent('alt_flights', async () => {
      emit({ type: 'progress', message: '✈️ Searching real-time flight deep-links...' });
      return { link: `https://www.skyscanner.com/transport/flights/${encodeURIComponent(location || '')}/?`, provider: 'Skyscanner' };
    }, ctx, emit),

    runAgent('alt_hotels', async () => {
      emit({ type: 'progress', message: '🏨 Searching emergency hotel availability...' });
      const { default: TripPlan } = await import('../models/TripPlan.js');
      const trip = await TripPlan.findById(tripId).lean();
      return { link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location || trip?.city || '')}`, provider: 'Booking.com' };
    }, ctx, emit),
  ]);

  emit({ type: 'done', message: '✅ Emergency Recovery Plan complete', summary: ctx.toSummary() });
  return ctx;
}
