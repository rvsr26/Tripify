/**
 * Tripify Enterprise — Production Test Suite
 * ESM-native automated test runner testing MCP Tools, Resources, Prompts,
 * Orchestrator, Verification Engine, Digital Twin, and Memory Graph.
 */
import { createMcpServer }       from '../src/mcp/server.js';
import { ExecutionDAGPlanner }    from '../src/orchestrator/dagPlanner.js';
import { ContextEngine }          from '../src/orchestrator/contextEngine.js';
import { DigitalTwinSimulator }  from '../src/orchestrator/simulation.js';
import { VerificationEngine }     from '../src/orchestrator/verificationEngine.js';
import { ReflectionEngine }       from '../src/orchestrator/reflection.js';
import { toolReliability }        from '../src/orchestrator/toolReliability.js';
import { queryKnowledgeGraph }    from '../src/orchestrator/memoryGraph.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 Running Tripify Enterprise Production Test Suite...\n');

  // Test 1: MCP Server Initialization
  console.log('1. Testing MCP Server Initialization & Tool Registration...');
  const server = createMcpServer();
  assert(server !== null, 'McpServer instantiated successfully');

  // Test 2: Context Engine & Token Compression
  console.log('\n2. Testing Context Engineering & Token Compression...');
  const contextEngine = new ContextEngine(80);
  const contextResult = contextEngine.buildContext({
    memory: { preferredInterests: ['Anime', 'Food', 'Culture', 'Shopping', 'Nature'], travelStyle: 'Luxury' },
    knowledgeGraph: queryKnowledgeGraph('Tokyo'),
    weather: { city: 'Tokyo', temp: '22', desc: 'Clear' },
    budget: 2000,
  });
  assert(contextResult.tokensUsed <= 200, 'Context Engine enforces max token budget');
  assert(contextResult.compressed === true, 'Token compression triggers when over budget');

  // Test 3: Execution DAG Planner
  console.log('\n3. Testing Execution DAG Planner & Task Dependencies...');
  const dagPlanner = new ExecutionDAGPlanner();
  const dag = dagPlanner.createExecutionDAG('7 days in Japan', 'Tokyo');
  assert(dag.nodes.length === 8, 'Execution DAG generates 8 sequential/parallel nodes');
  assert(dag.nodes[0].task.includes('Memory'), 'First node starts with Memory Graph lookup');

  // Test 4: Digital Twin Simulation Engine
  console.log('\n4. Testing Digital Twin Traveler Simulation...');
  const simulator = new DigitalTwinSimulator({ walkingTolerance: 'Moderate' });
  const mockItinerary = {
    days: [
      { day: 1, title: 'Arrival & Shinjuku', activities: [{ activity: 'Tokyo Skytree' }, { activity: 'Sensoji Museum' }] },
      { day: 2, title: 'Akihabara & Shibuya', activities: [{ activity: 'Shibuya Crossing' }, { activity: 'Meiji Shrine' }] },
    ]
  };
  const simResult = simulator.simulateTrip(mockItinerary, 'Tokyo', 'Clear');
  assert(simResult.metrics.resilienceScore >= 50, 'Digital Twin returns valid resilience score (50-100)');
  assert(simResult.daySimulations.length === 2, 'Simulates pacing for all itinerary days');

  // Test 5: Verification Engine & Hallucination Guard
  console.log('\n5. Testing Verification Pipeline & Hallucination Guard...');
  const verifier = new VerificationEngine();
  const verResult = verifier.verifyItinerary(mockItinerary, 'Tokyo');
  assert(verResult.passed === true, 'Verifier approves realistic itinerary');
  assert(verResult.verifiedCount === 4, 'Verifies all 4 daily activities');

  // Test 6: Reflection Engine & Quality Evaluation
  console.log('\n6. Testing Reflection Engine & Multi-Metric Scoring...');
  const reflectionEngine = new ReflectionEngine();
  const evalResult = await reflectionEngine.evaluateItinerary(mockItinerary, '7 days in Japan', 'Tokyo');
  assert(evalResult.scores.overall >= 75, 'Reflection Engine overall score meets 75% threshold');
  assert(evalResult.confidenceScore > 80, 'Generates confidence score above 80%');

  // Test 7: Tool Reliability Engine & Circuit Breaker
  console.log('\n7. Testing Tool Reliability Tracker & Circuit Breaker...');
  toolReliability.recordExecution('get_weather', 120, true);
  toolReliability.recordExecution('get_weather', 150, true);
  const stats = toolReliability.getToolStats('get_weather');
  assert(stats.reliabilityScore === 100, 'Tool reliability score reaches 100% on successful executions');

  // Summary
  console.log(`\n==================================================`);
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('🔥 Test runner crashed:', err);
  process.exit(1);
});
