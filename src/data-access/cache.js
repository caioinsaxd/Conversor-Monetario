export class CacheManager {
  constructor(ttlSeconds = 120) {
    this.cache = new Map();
    this.ttlSeconds = ttlSeconds;
  }

  generateKey(fromCurrency, toCurrency) {
    return `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
  }

  get(fromCurrency, toCurrency) {
    const key = this.generateKey(fromCurrency, toCurrency);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > this.ttlSeconds * 1000;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(fromCurrency, toCurrency, data) {
    const key = this.generateKey(fromCurrency, toCurrency);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      ttlSeconds: this.ttlSeconds,
    };
  }
}

export const cacheManager = new CacheManager(120); //2 min de cache
