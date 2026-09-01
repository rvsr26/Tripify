# 🧪 Tripify Enterprise — Production Test & Benchmark Guide

## Running the Automated Test Suite

The repository includes an ESM-native test runner testing MCP tools, context compression, execution DAGs, digital twin simulations, verifiers, and reflection engines.

```bash
cd backend
node tests/index.test.js
```

### Verified Test Assertions

1. **MCP Server Initialization**: Verifies `McpServer` instantiates and registers 23 tools, 5 resources, 5 prompts.
2. **Context Engineering & Compression**: Verifies token budget enforcement and automatic compression.
3. **Execution DAG Planner**: Verifies 8-node task dependency generation starting with Memory Graph lookup.
4. **Digital Twin Traveler Simulation**: Verifies traveler fatigue curve calculation and resilience scoring.
5. **Verification Pipeline**: Verifies opening hours, physical distance feasibility, and hallucination checks.
6. **Reflection Engine**: Verifies multi-metric 7-dimension scoring and confidence evaluation.
7. **Tool Reliability Tracker**: Verifies call recording, latency metrics, and circuit breaker activation.

## Frontend Build Verification

To verify that the frontend web client compiles with 0 errors:

```bash
cd frontend
npm run build
```
