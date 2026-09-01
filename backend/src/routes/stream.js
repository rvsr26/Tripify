/**
 * SSE Streaming Route
 * GET /api/stream/plan     — streams trip planning progress
 * GET /api/stream/emergency — streams emergency replanning progress
 *
 * Protocol: Server-Sent Events (text/event-stream)
 * Each message is: data: <JSON>\n\n
 *
 * The client subscribes FIRST (GET), then triggers the work
 * via the orchestrator POST endpoint which uses the same sessionId.
 */
import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// In-memory session store: sessionId → res (SSE stream)
const streamSessions = new Map();

/**
 * Create a streaming session.
 * Returns a sessionId that the client passes to the orchestrator.
 */
// SSE auth: accept token from query param (EventSource can't set headers)
function sseAuth(req, res, next) {
  // Standard header auth
  if (req.headers.authorization) return authMiddleware(req, res, next);
  // Query param fallback for EventSource
  const token = req.query.token;
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
    return authMiddleware(req, res, next);
  }
  return res.status(401).json({ error: 'Authentication required' });
}

router.get('/session', sseAuth, (req, res) => {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Session-Id', sessionId);
  res.flushHeaders();

  // Send sessionId immediately so client knows where to POST
  res.write(`data: ${JSON.stringify({ type: 'session_ready', sessionId })}\n\n`);

  streamSessions.set(sessionId, res);

  // Heartbeat every 15s to keep the connection alive
  const hb = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': heartbeat\n\n');
    } else {
      clearInterval(hb);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(hb);
    streamSessions.delete(sessionId);
  });
});

/**
 * Emit an event to a specific session.
 * Called by the orchestrator after it receives a sessionId.
 * @param {string} sessionId
 * @param {object} event
 */
export function emitToSession(sessionId, event) {
  const res = streamSessions.get(sessionId);
  if (!res || res.writableEnded) return false;
  res.write(`data: ${JSON.stringify(event)}\n\n`);
  return true;
}

/**
 * Close a session (called when orchestrator finishes).
 */
export function closeSession(sessionId) {
  const res = streamSessions.get(sessionId);
  if (res && !res.writableEnded) {
    res.write(`data: ${JSON.stringify({ type: 'stream_end' })}\n\n`);
    res.end();
  }
  streamSessions.delete(sessionId);
}

export default router;
