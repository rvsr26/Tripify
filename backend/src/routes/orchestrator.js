/**
 * Orchestrator HTTP Route — Autonomous AI OS Endpoints
 * POST /api/orchestrate/plan      — run full trip planning with streaming
 * POST /api/orchestrate/emergency — run emergency replanning with streaming
 * POST /api/orchestrate/voice     — parse voice transcript then stream plan
 * GET  /api/orchestrate/memory    — fetch user long-term travel memory graph
 * POST /api/orchestrate/simulate  — run digital twin traveler simulation
 * POST /api/orchestrate/debate    — run multi-agent debate stream
 * GET  /api/orchestrate/telemetry — fetch live system observability metrics
 * POST /api/orchestrate/research  — run autonomous deep research loop
 */
import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { orchestrateTripPlan, orchestrateEmergency } from '../orchestrator/index.js';
import { emitToSession, closeSession } from './stream.js';
import { handleVoiceToTrip } from '../mcp/tools/intelligence.tools.js';
import { getUserMemoryGraph } from '../orchestrator/memoryGraph.js';
import { DigitalTwinSimulator } from '../orchestrator/simulation.js';
import { HierarchicalAgentSystem } from '../orchestrator/hierarchical.js';
import { toolReliability } from '../orchestrator/toolReliability.js';
import { mcpFederation }  from '../orchestrator/mcpFederation.js';
import { promptRegistry } from '../orchestrator/promptRegistry.js';
import { AutonomousResearchLoop } from '../orchestrator/autonomousResearch.js';

const router = express.Router();

function buildEmitter(sessionId) {
  if (!sessionId) return () => {};
  return (event) => emitToSession(sessionId, event);
}

// ── POST /api/orchestrate/plan ────────────────────────────────────────────────
router.post('/plan', authMiddleware, async (req, res) => {
  const { prompt, optionKey, optionData, parsedData, sessionId } = req.body;
  const userId = req.userId;

  if (!prompt && !optionData) {
    return res.status(400).json({ error: 'prompt or optionData required' });
  }

  res.json({ status: 'started', sessionId: sessionId || null, message: 'Orchestration in progress. Watch the SSE stream for updates.' });

  const emit = buildEmitter(sessionId);

  try {
    const ctx = await orchestrateTripPlan({
      prompt, optionKey, optionData, parsedData, userId, emit,
    });
    if (sessionId) closeSession(sessionId);
  } catch (err) {
    emit({ type: 'error', message: err.message });
    if (sessionId) closeSession(sessionId);
  }
});

// ── POST /api/orchestrate/emergency ──────────────────────────────────────────
router.post('/emergency', authMiddleware, async (req, res) => {
  const { tripId, disruption, location, sessionId } = req.body;
  const userId = req.userId;

  if (!tripId || !disruption) {
    return res.status(400).json({ error: 'tripId and disruption are required' });
  }

  res.json({ status: 'started', sessionId: sessionId || null, message: 'Emergency orchestration started.' });

  const emit = buildEmitter(sessionId);

  try {
    await orchestrateEmergency({ tripId, disruption, location, userId, emit });
    if (sessionId) closeSession(sessionId);
  } catch (err) {
    emit({ type: 'error', message: err.message });
    if (sessionId) closeSession(sessionId);
  }
});

// ── POST /api/orchestrate/voice ───────────────────────────────────────────────
router.post('/voice', authMiddleware, async (req, res) => {
  const { transcript, sessionId } = req.body;
  const userId = req.userId;

  if (!transcript) return res.status(400).json({ error: 'transcript required' });

  const emit = buildEmitter(sessionId);
  emit({ type: 'progress', message: '🎤 Parsing voice input...' });

  try {
    const parseResult = await handleVoiceToTrip({ transcript });
    const parsed = JSON.parse(parseResult.content[0].text);

    if (!parsed.success) {
      emit({ type: 'error', message: 'Could not parse voice input' });
      return res.status(422).json({ error: 'Could not parse voice input', transcript });
    }

    res.json({ status: 'parsed', parsed: parsed.parsed, originalTranscript: transcript });

    emit({ type: 'progress', message: `✅ Voice parsed! Planning trip to ${parsed.parsed?.destination}...` });

    await orchestrateTripPlan({
      prompt:    transcript,
      optionData: null,
      parsedData: null,
      userId,
      emit,
    });

    if (sessionId) closeSession(sessionId);
  } catch (err) {
    emit({ type: 'error', message: err.message });
    if (sessionId) closeSession(sessionId);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orchestrate/memory ───────────────────────────────────────────────
router.get('/memory', authMiddleware, async (req, res) => {
  try {
    const memory = await getUserMemoryGraph(req.userId);
    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/orchestrate/simulate ───────────────────────────────────────────
router.post('/simulate', authMiddleware, async (req, res) => {
  try {
    const { itinerary, city } = req.body;
    const memory = await getUserMemoryGraph(req.userId);
    const simulator = new DigitalTwinSimulator(memory);
    const simulation = simulator.simulateTrip(itinerary, city || 'Destination', 'Clear');
    res.json({ success: true, simulation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/orchestrate/debate ─────────────────────────────────────────────
router.post('/debate', authMiddleware, async (req, res) => {
  try {
    const { prompt, destination, days, budget, sessionId } = req.body;
    const emit = buildEmitter(sessionId);
    const hierarchy = new HierarchicalAgentSystem(req.userId, emit);
    const turns = await hierarchy.runAgentDebate(prompt || 'Trip', destination || 'Tokyo', days || 5, budget || '$1500');
    res.json({ success: true, debateTurns: turns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orchestrate/telemetry ───────────────────────────────────────────
router.get('/telemetry', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      toolHealthMetrics: toolReliability.getAllMetrics(),
      federation: mcpFederation.getFederationSummary(),
      promptVersions: promptRegistry.getAllPrompts(),
      systemStatus: 'Optimal',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/orchestrate/research ───────────────────────────────────────────
router.post('/research', authMiddleware, async (req, res) => {
  try {
    const { city, interests, month, sessionId } = req.body;
    const emit = buildEmitter(sessionId);
    const deepResearch = new AutonomousResearchLoop(85);
    const result = await deepResearch.executeResearch(city || 'Tokyo', interests || [], month || 'October', emit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
