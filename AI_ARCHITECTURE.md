# 🧠 Tripify Enterprise — AI & Multi-Agent Architecture

## Hierarchical Agent Topology

Tripify replaces single-prompt wrappers with a frontier-grade hierarchical multi-agent architecture:

- **CEO Agent (`System Coordinator`)**: Accepts user natural language inputs, decomposes requests into dependency DAGs, and oversees execution.
- **Manager Agents**:
  - `PlanningManager`: Oversees daily activity distribution, geocoordinate route clustering, and attraction pacing.
  - `FinancialManager`: Oversees cost allocations, budget targets, and expense debt simplification.
  - `RiskAndSafetyManager`: Oversees weather forecasts, destination safety scores, and emergency disruption recoveries.
- **Specialized Expert Agents**:
  - `Planner Agent`: Generates initial tier option options.
  - `Weather Agent`: Queries live `wttr.in` weather forecasts.
  - `Safety Agent`: Evaluates safety advisories and emergency phone numbers.
  - `Packing Agent`: Builds destination-aware checklist arrays.
  - `Events Agent`: Finds seasonal festivals and local highlights.
  - `Emergency Agent`: Re-plans trips autonomously when flights or hotels are disrupted.

## Agentic Reasoning Pipelines

### 1. Multi-Agent Debate & Disagreement Resolution
Agents engage in multi-turn debate (`Planner` proposes → `Budget` critiques → `Safety` critiques → `Culture` enhances → `CEO` resolves).

### 2. Tree of Thoughts (ToT) Candidate Search
Generates candidate plan paths (Option A, B, C), evaluates heuristic scores across budget, comfort, and culture, and selects the winning branch with explicit selection reasoning.

### 3. Digital Twin Traveler Simulation
Simulates traveler fatigue index (0–100) based on cumulative daily walking distances and duration. Stress-tests weather risks and queue delays before itinerary approval.

### 4. Critic Agent Self-Reflection
Evaluates itineraries across 7 dimensions (Budget, Safety, Culture, Efficiency, Weather, Carbon, Walking) and generates an automated confidence score (0–100%).
