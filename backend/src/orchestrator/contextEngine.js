/**
 * Context Engineering & Token-Aware Compression Engine
 * Builds, sanitizes, and compresses context windows before LLM inference.
 */

export class ContextEngine {
  constructor(maxTokenBudget = 8000) {
    this.maxTokenBudget = maxTokenBudget;
  }

  /**
   * Estimate token count (rough heuristic: 1 token ≈ 4 characters).
   */
  estimateTokens(text) {
    if (typeof text !== 'string') text = JSON.stringify(text || '');
    return Math.ceil(text.length / 4);
  }

  /**
   * Assemble structured context from memory, knowledge graph, weather, budget, and chat history.
   */
  buildContext({ memory, knowledgeGraph, weather, budget, history = [], systemPrompt }) {
    const rawSections = {
      system: systemPrompt || 'You are an autonomous AI travel OS.',
      userPreferences: memory?.preferredInterests || [],
      travelStyle: memory?.travelStyle || 'Balanced Explorer',
      destinationInsights: knowledgeGraph ? {
        neighborhoods: knowledgeGraph.neighborhoods,
        topAttractions: knowledgeGraph.attractions?.slice(0, 4),
        safetyScore: knowledgeGraph.safetyScore,
      } : null,
      weatherContext: weather ? { city: weather.city, temp: weather.temp, desc: weather.desc } : null,
      budgetConstraint: budget ? `$${budget}` : 'Flexible',
      recentHistory: history.slice(-4),
    };

    const rawString = JSON.stringify(rawSections);
    const estimatedTokens = this.estimateTokens(rawString);

    if (estimatedTokens <= this.maxTokenBudget) {
      return {
        context: rawSections,
        compressed: false,
        tokensUsed: estimatedTokens,
        tokenBudget: this.maxTokenBudget,
      };
    }

    // Token-Aware Compression
    const compressedSections = {
      system: rawSections.system,
      userPreferences: rawSections.userPreferences.slice(0, 3),
      travelStyle: rawSections.travelStyle,
      destinationInsights: rawSections.destinationInsights ? {
        topAttractions: rawSections.destinationInsights.topAttractions?.slice(0, 2),
        safetyScore: rawSections.destinationInsights.safetyScore,
      } : null,
      weatherContext: rawSections.weatherContext,
      budgetConstraint: rawSections.budgetConstraint,
      recentHistory: rawSections.recentHistory.slice(-2),
    };

    const compressedTokens = this.estimateTokens(JSON.stringify(compressedSections));

    return {
      context: compressedSections,
      compressed: true,
      tokensUsed: compressedTokens,
      tokensSaved: estimatedTokens - compressedTokens,
      tokenBudget: this.maxTokenBudget,
    };
  }
}
