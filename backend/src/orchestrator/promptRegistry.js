/**
 * Prompt Versioning & Quality Optimizer Registry
 * Manages versioned system prompt templates with latency, cost, and quality scoring.
 */

export class PromptRegistry {
  constructor() {
    this.prompts = new Map();
    this.initDefaultPrompts();
  }

  initDefaultPrompts() {
    this.register('plan_trip_system', 'v1.2.0', {
      template: 'You are Tripify Senior Travel Architect. Generate valid 3-plan options JSON.',
      avgQualityScore: 94,
      avgLatencyMs: 1250,
      usageCount: 142,
    });
    this.register('safety_advisor', 'v1.0.1', {
      template: 'You are a travel safety expert. Return safety score 1-10 and emergency numbers.',
      avgQualityScore: 96,
      avgLatencyMs: 820,
      usageCount: 89,
    });
    this.register('emergency_replanner', 'v2.0.0', {
      template: 'You are Tripify Emergency Travel Coordinator. Provide calm, actionable recovery plan.',
      avgQualityScore: 98,
      avgLatencyMs: 1400,
      usageCount: 54,
    });
  }

  register(name, version, data) {
    if (!this.prompts.has(name)) this.prompts.set(name, []);
    this.prompts.get(name).push({ version, ...data, registeredAt: new Date().toISOString() });
  }

  getBestPrompt(name) {
    const versions = this.prompts.get(name) || [];
    if (!versions.length) return null;
    // Return highest quality version
    return [...versions].sort((a, b) => (b.avgQualityScore || 0) - (a.avgQualityScore || 0))[0];
  }

  getAllPrompts() {
    const summary = {};
    for (const [name, list] of this.prompts.entries()) {
      summary[name] = list;
    }
    return summary;
  }
}

export const promptRegistry = new PromptRegistry();
