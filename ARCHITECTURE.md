# 🏛️ Tripify Enterprise — Monorepo System Architecture

## System Design Overview

Tripify Enterprise is an MCP-native Autonomous AI Operating System for Travel built on Node.js, Express, MongoDB, React 19, Flutter, Socket.io, and Anthropic's `@modelcontextprotocol/sdk`.

```
                  ┌──────────────────────────────────────────────┐
                  │    React 19 SPA / Flutter Mobile Client      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                   HTTP / SSE / WSS
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │          Express API Gateway & Security       │
                  │   (Helmet, Global/Auth/AI Rate Limiters, JWT) │
                  └──────┬───────────────────────┬───────────────┘
                         │                       │
           ┌─────────────▼────────────┐   ┌──────▼─────────────────────┐
           │ StreamableHTTP & SSE MCP │   │ Multi-Agent AI Orchestrator│
           │      Transport Layer     │   │ (CEO → Managers → Experts)  │
           └─────────────┬────────────┘   └──────┬─────────────────────┘
                         │                       │
                         └───────────┬───────────┘
                                     │
                  ┌──────────────────▼───────────────────────────┐
                  │        23 Registered MCP Domain Tools        │
                  │ (Zod Schemas + Multi-Model Gemini Fallbacks) │
                  └──────────────────┬───────────────────────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             │                       │                       │
  ┌──────────▼──────────┐ ┌──────────▼──────────┐ ┌──────────▼──────────┐
  │ MongoDB Atlas Store │ │ Memory & Knowledge  │ │ InMemory AppCache   │
  │ (Indexed ODM Schemas)││     Graph Engine    │ │ (TTL Caching)       │
  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

## Key Infrastructure Layers

1. **Client & Observability Layer**: React 19 web application with Web Speech API voice input, real-time SSE progress streaming, Socket.io collaborative whiteboarding, Judge Mode telemetry overlay, and MCP Developer Console.
2. **API Gateway & Security**: Rate limiters (`express-rate-limit`), Helmet security headers, CORS origin protection, JWT authentication middleware, and input bounds checking.
3. **MCP Protocol Server**: Powered by `@modelcontextprotocol/sdk`. Exposes 23 tools, 5 resources, and 5 prompts via StreamableHTTP (`POST /api/mcp`) and SSE fallback (`GET /api/mcp/sse`).
4. **Hierarchical AI Orchestrator**: Coordinates CEO, Manager, and Expert agents. Manages parallel tool executions, Tree of Thoughts candidate searches, Digital Twin traveler simulations, and Critic self-reflection evaluations.
5. **Persistence & Caching**: MongoDB Atlas database with secondary indexes (`members.userId`, `city`, `isPublic`), coupled with an in-memory TTL application cache.
