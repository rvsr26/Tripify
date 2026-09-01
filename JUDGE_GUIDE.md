# ⚡ NitroStack Hackathon — Judge Quick-Start & Verification Guide

Welcome, Hackathon Judges! This guide provides a 3-minute fast-track verification workflow to inspect Tripify Enterprise's MCP capabilities, multi-agent AI orchestrator, and real-time observability.

## 🚀 Quick-Start Options

### Option A: Local Run (2 Minutes)

```bash
# 1. Start Backend
cd backend
npm install
npm start

# 2. Start Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

---

## 🔍 Key Features to Test During Judging

1. **⚡ Judge Mode Telemetry Panel**: Look for the floating **⚡ JUDGE MODE** button in the bottom right corner. Click to toggle real-time MCP call counts, estimated token usage, cache hits, and orchestrator status.
2. **📡 MCP Developer Console**: Click the **📡 MCP Console** button in the top navigation bar to open the live MCP tool playground. Select any of the 23 tools (e.g. `get_weather`, `get_safety_info`), enter JSON parameters, and click **Execute MCP Tool** to view raw tool payloads.
3. **💬 Multi-Agent Debate Visualizer**: Submit a trip prompt in the AI Planner (`/planner`). Choose a plan option and observe the real-time dialogue between `Planner Agent`, `Budget Agent`, `Safety Agent`, `Culture Agent`, and `CEO Agent`.
4. **🏃 Digital Twin Traveler Simulation**: Open any trip itinerary (`/trips/:id`) and click **🏃 Digital Twin Simulation** to run a traveler fatigue, queue delay, and weather risk stress-test.
5. **🆘 Autonomous Emergency AI Replanner**: On any trip detail screen, click **🆘 Emergency AI** in the top header. Click a disruption preset (`✈️ Flight Cancelled`) and watch the emergency agent re-plan activities and search alternative flights in under 8 seconds.

---

## 🧪 Automated Verification Commands

```bash
# Run Backend Test Suite
cd backend && node tests/index.test.js

# Verify Production Frontend Build
cd frontend && npm run build
```
