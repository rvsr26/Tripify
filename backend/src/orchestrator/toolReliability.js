/**
 * Tool Reliability, Health & Circuit Breaker Engine
 * Tracks runtime metrics per MCP tool and handles automatic degradation & retries.
 */

class ToolReliabilityEngine {
  constructor() {
    this.metrics = new Map(); // toolName -> { calls, successes, failures, retries, totalLatencyMs, lastStatus, circuitOpen }
  }

  getToolStats(toolName) {
    if (!this.metrics.has(toolName)) {
      this.metrics.set(toolName, {
        toolName,
        calls: 0,
        successes: 0,
        failures: 0,
        retries: 0,
        totalLatencyMs: 0,
        avgLatencyMs: 0,
        reliabilityScore: 100,
        lastStatus: 'healthy',
        circuitOpen: false,
      });
    }
    return this.metrics.get(toolName);
  }

  recordExecution(toolName, latencyMs, success, retries = 0) {
    const stats = this.getToolStats(toolName);
    stats.calls += 1;
    stats.totalLatencyMs += latencyMs;
    stats.avgLatencyMs = Math.round(stats.totalLatencyMs / stats.calls);
    stats.retries += retries;

    if (success) {
      stats.successes += 1;
      stats.lastStatus = 'healthy';
    } else {
      stats.failures += 1;
      stats.lastStatus = 'degraded';
    }

    // Calculate Reliability Score (0-100%)
    stats.reliabilityScore = Math.round((stats.successes / stats.calls) * 100);

    // Circuit Breaker Trigger (open if failure rate > 50% on at least 4 calls)
    if (stats.calls >= 4 && (stats.failures / stats.calls) > 0.5) {
      stats.circuitOpen = true;
      stats.lastStatus = 'circuit_open';
    } else {
      stats.circuitOpen = false;
    }

    return stats;
  }

  getAllMetrics() {
    const report = [];
    for (const [name, stats] of this.metrics.entries()) {
      report.push({ ...stats });
    }
    return report;
  }
}

export const toolReliability = new ToolReliabilityEngine();
