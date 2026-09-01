/**
 * Autonomous Deep Research Loop Engine
 * Iterative evidence collection & synthesis loop inspired by OpenAI Deep Research.
 */
import { handleWeather, handleDestinationEvents } from '../mcp/tools/intelligence.tools.js';
import { handleSafetyInfo, handleReviewSummary }   from '../mcp/tools/planner.tools.js';

export class AutonomousResearchLoop {
  constructor(confidenceThreshold = 85) {
    this.confidenceThreshold = confidenceThreshold;
  }

  /**
   * Run multi-turn autonomous deep research over a destination.
   */
  async executeResearch(city, interests = [], month = 'October', emit = () => {}) {
    emit({ type: 'progress', message: `🔬 Deep Research Loop: Initiating evidence collection for ${city}...` });

    let currentConfidence = 0;
    let iteration = 0;
    const maxIterations = 3;
    const evidenceCollection = {
      city,
      weather: null,
      safety: null,
      events: null,
      reviews: null,
    };

    while (currentConfidence < this.confidenceThreshold && iteration < maxIterations) {
      iteration += 1;
      emit({ type: 'progress', message: `🔍 Deep Research Pass ${iteration}/${maxIterations}: Querying domain sources...` });

      if (!evidenceCollection.weather) {
        try {
          const res = await handleWeather({ city });
          evidenceCollection.weather = JSON.parse(res.content[0].text);
          currentConfidence += 25;
        } catch { /* ignore */ }
      }

      if (!evidenceCollection.safety) {
        try {
          const res = await handleSafetyInfo({ city }, 'system');
          evidenceCollection.safety = JSON.parse(res.content[0].text);
          currentConfidence += 25;
        } catch { /* ignore */ }
      }

      if (!evidenceCollection.events) {
        try {
          const res = await handleDestinationEvents({ city, month, interests });
          evidenceCollection.events = JSON.parse(res.content[0].text);
          currentConfidence += 20;
        } catch { /* ignore */ }
      }

      if (!evidenceCollection.reviews) {
        try {
          const res = await handleReviewSummary({ placeId: city }, 'system');
          evidenceCollection.reviews = JSON.parse(res.content[0].text);
          currentConfidence += 20;
        } catch { /* ignore */ }
      }
    }

    emit({ type: 'progress', message: `✅ Deep Research Complete (Confidence: ${currentConfidence}% across ${iteration} passes)` });

    return {
      success: true,
      confidence: currentConfidence,
      iterationsUsed: iteration,
      evidence: evidenceCollection,
    };
  }
}
