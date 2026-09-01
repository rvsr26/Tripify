/**
 * Application Cache
 * In-memory TTL cache — zero external dependencies.
 * Drop-in Redis replacement: when REDIS_URL is set in the environment,
 * swap the implementation here without changing call sites.
 *
 * Usage:
 *   import { appCache } from '../lib/cache.js';
 *   appCache.set('key', value, ttlSeconds);
 *   const value = appCache.get('key');  // null if expired
 *   appCache.del('key');
 */

class InMemoryCache {
  constructor() {
    this._store = new Map();
    // Sweep expired keys every 5 minutes
    setInterval(() => this._sweep(), 5 * 60 * 1000).unref();
  }

  set(key, value, ttlSeconds = 300) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return true;
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  del(key) {
    this._store.delete(key);
  }

  has(key) {
    return this.get(key) !== null;
  }

  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now > entry.expiresAt) this._store.delete(key);
    }
  }

  /** Wrap an async function with caching */
  async wrap(key, fn, ttlSeconds = 300) {
    const cached = this.get(key);
    if (cached !== null) return cached;
    const result = await fn();
    this.set(key, result, ttlSeconds);
    return result;
  }

  get size() { return this._store.size; }
}

export const appCache = new InMemoryCache();

// ─── Cache key helpers ──────────────────────────────────────────────────────

export const CacheKeys = {
  weather:    (city)   => `weather:${city.toLowerCase().replace(/\s+/g, '_')}`,
  safety:     (city)   => `safety:${city.toLowerCase().replace(/\s+/g, '_')}`,
  packing:    (tripId) => `packing:${tripId}`,
  aiOptions:  (prompt) => `ai_options:${Buffer.from(prompt).toString('base64').slice(0, 32)}`,
  userStats:  (userId) => `stats:${userId}`,
  templates:  ()       => 'templates:all',
};
