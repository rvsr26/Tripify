# 📡 Tripify Enterprise — Model Context Protocol (MCP) Specification

## Protocol Compliance Summary

Tripify Enterprise embeds an official `@modelcontextprotocol/sdk` `McpServer` instance, exposing the entire travel domain as standard MCP primitives.

| Primitive | Quantity | Details |
|---|:---:|---|
| **MCP Tools** | `23` | Zod-validated tool definitions for planning, intelligence, social, collaboration, and emergency. |
| **MCP Resources** | `5` | `trips://`, `itinerary://`, `journal://`, `bucketlist://`, `profile://` URI schemes returning `application/json`. |
| **MCP Prompts** | `5` | `plan_trip_system`, `safety_advisor`, `emergency_replanner`, `story_captioner`, `budget_negotiator`. |
| **Transports** | `2` | StreamableHTTP (`POST /api/mcp`) & SSE Fallback (`GET /api/mcp/sse`). |

## Exposed Endpoints

- `POST /api/mcp`: Stateful StreamableHTTP transport endpoint.
- `GET  /api/mcp`: Server-to-client GET stream for active StreamableHTTP session.
- `DELETE /api/mcp`: Terminates active StreamableHTTP session.
- `GET  /api/mcp/sse`: Server-Sent Events fallback transport.
- `POST /api/mcp/sse/message`: Client-to-server POST message endpoint for SSE transport.
- `GET  /api/mcp/info`: Metadata health & capability discovery endpoint.
