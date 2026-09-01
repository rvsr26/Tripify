/**
 * MCP Transport Layer
 * Exposes the Tripify MCP Server over:
 *   1. StreamableHTTP (POST /mcp)  — primary, used by Claude Desktop, MCP Inspector
 *   2. SSE (GET /mcp/sse)          — fallback for browsers and older MCP clients
 *   3. DELETE /mcp                 — session cleanup for StreamableHTTP
 *
 * Each HTTP request creates a new transport instance.
 * The McpServer instance is shared (created once at startup).
 *
 * Authentication: Every request must carry a valid JWT Bearer token.
 * The userId is injected into the MCP extra context so all tool handlers
 * can use it without re-parsing the token.
 */
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport }            from '@modelcontextprotocol/sdk/server/sse.js';
import { isInitializeRequest }           from '@modelcontextprotocol/sdk/types.js';
import { extractUserFromRequest }        from './auth.js';

// In-process session store for StreamableHTTP (stateful sessions)
const sessions = new Map(); // sessionId → transport

/**
 * Register /mcp, /mcp/sse, and /mcp/delete routes on an Express router.
 * @param {import('express').Router} router
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcpServer
 */
export function registerMcpTransports(router, mcpServer) {

  // ── StreamableHTTP (Primary) ─────────────────────────────────────────────
  router.post('/mcp', async (req, res) => {
    // Authenticate
    let userId;
    try {
      userId = extractUserFromRequest(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    try {
      const sessionId = req.headers['mcp-session-id'];
      let transport;

      if (sessionId && sessions.has(sessionId)) {
        // Reuse existing session
        transport = sessions.get(sessionId);
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New session initialisation
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => `tripify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          onsessioninitialized: (id) => { sessions.set(id, transport); },
        });
        transport.onclose = () => {
          if (transport.sessionId) sessions.delete(transport.sessionId);
        };
        // Connect server with userId in extra context
        await mcpServer.connect(transport, { userId });
      } else {
        return res.status(400).json({ error: 'Bad Request: missing or invalid session' });
      }

      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('[MCP StreamableHTTP] Error:', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    }
  });

  // ── GET streaming (StreamableHTTP GET for server→client streams) ──────────
  router.get('/mcp', async (req, res) => {
    let userId;
    try {
      userId = extractUserFromRequest(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(400).json({ error: 'Session not found. POST /mcp first to initialize.' });
    }

    const transport = sessions.get(sessionId);
    await transport.handleRequest(req, res);
  });

  // ── DELETE — clean up session ──────────────────────────────────────────────
  router.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (sessionId && sessions.has(sessionId)) {
      const transport = sessions.get(sessionId);
      await transport.close();
      sessions.delete(sessionId);
    }
    res.status(200).json({ message: 'Session closed' });
  });

  // ── SSE Fallback (for browsers / legacy clients) ───────────────────────────
  // This creates a long-lived SSE connection per client.
  const sseTransports = new Map(); // clientId → SSEServerTransport

  router.get('/mcp/sse', async (req, res) => {
    let userId;
    try {
      userId = extractUserFromRequest(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    try {
      const transport = new SSEServerTransport('/mcp/sse/message', res);
      sseTransports.set(transport.sessionId, transport);

      transport.onclose = () => sseTransports.delete(transport.sessionId);

      await mcpServer.connect(transport, { userId });
      await transport.start();
    } catch (err) {
      console.error('[MCP SSE] Error:', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    }
  });

  // SSE message endpoint (client→server messages in SSE mode)
  router.post('/mcp/sse/message', async (req, res) => {
    let userId;
    try {
      userId = extractUserFromRequest(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    const sessionId = req.query.sessionId;
    const transport = sseTransports.get(sessionId);
    if (!transport) {
      return res.status(404).json({ error: 'SSE session not found' });
    }

    await transport.handlePostMessage(req, res, req.body);
  });

  // ── MCP Health / Discovery endpoint ───────────────────────────────────────
  router.get('/mcp/info', (_req, res) => {
    res.json({
      name:      'Tripify Enterprise MCP Server',
      version:   '1.0.0',
      tools:     23,
      resources: 5,
      prompts:   5,
      transport: ['StreamableHTTP', 'SSE'],
      endpoints: {
        streamableHTTP: 'POST /api/mcp',
        sse:            'GET  /api/mcp/sse',
        sseMessage:     'POST /api/mcp/sse/message',
      },
    });
  });

  console.log('✅ MCP Transports registered: POST/GET/DELETE /api/mcp  |  GET /api/mcp/sse');
}
