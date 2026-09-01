/**
 * Frontier Model Provider Registry & Provider Abstraction
 * Plug-and-play abstraction for Gemini, OpenAI, Claude, and local models.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

class BaseLLMProvider {
  constructor(name) {
    this.name = name;
  }
  async generateContent(prompt, options = {}) {
    throw new Error('generateContent must be implemented');
  }
}

class GeminiProvider extends BaseLLMProvider {
  constructor() {
    super('google-gemini');
    this.genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
  }

  async generateContent(prompt, options = {}) {
    const modelName = options.model || 'gemini-2.5-flash';
    if (!this.genAI) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: options.json ? 'application/json' : 'text/plain',
      },
    });
    const result = await model.generateContent(prompt);
    return {
      text: result.response.text(),
      provider: this.name,
      model: modelName,
    };
  }
}

class ModelProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.register('default', new GeminiProvider());
    this.register('gemini', new GeminiProvider());
  }

  register(name, provider) {
    this.providers.set(name, provider);
  }

  get(name = 'default') {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Model provider '${name}' not registered`);
    return provider;
  }

  async generate(prompt, options = {}) {
    const providerName = options.provider || 'default';
    const provider = this.get(providerName);
    return await provider.generateContent(prompt, options);
  }
}

export const modelRegistry = new ModelProviderRegistry();
