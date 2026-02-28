import { config } from '../config/index.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheManager<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  public readonly ttlSeconds: number;

  constructor(ttlSeconds: number = 120) {
    this.cache = new Map();
    this.ttlSeconds = ttlSeconds;
  }

  generateKey(fromCurrency: string, toCurrency: string): string {
    return `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
  }

  get(fromCurrency: string, toCurrency: string): T | null {
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

  set(fromCurrency: string, toCurrency: string, data: T): void {
    const key = this.generateKey(fromCurrency, toCurrency);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; ttlSeconds: number } {
    return {
      size: this.cache.size,
      ttlSeconds: this.ttlSeconds,
    };
  }
}

export const cacheManager = new CacheManager(config.CACHE_TTL);
