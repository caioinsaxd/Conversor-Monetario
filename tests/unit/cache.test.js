import { describe, it, expect, beforeEach } from '@jest/globals';
import { CacheManager } from '../../src/data-access/cache.js';

describe('CacheManager', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheManager(1); //1 sec de TTL pra testes
  });

  describe('get and set', () => {
    it('should store and retrieve data from cache', () => {
      const data = { rate: 5.5, source: 'API' };
      cache.set('USD', 'BRL', data);

      const result = cache.get('USD', 'BRL');
      expect(result).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('USD', 'EUR');
      expect(result).toBeNull();
    });

    it('should be case insensitive', () => {
      const data = { rate: 5.5 };
      cache.set('usd', 'brl', data);

      const result = cache.get('USD', 'BRL');
      expect(result).toEqual(data);
    });
  });

  describe('expiration', () => {
    it('should return null for expired data', async () => {
      const data = { rate: 5.5 };
      cache.set('USD', 'BRL', data);

      //aguarda 2 sec
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = cache.get('USD', 'BRL');
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cache.set('USD', 'BRL', { rate: 5.5 });
      cache.set('EUR', 'BRL', { rate: 6.0 });

      cache.clear();

      expect(cache.get('USD', 'BRL')).toBeNull();
      expect(cache.get('EUR', 'BRL')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('USD', 'BRL', { rate: 5.5 });
      const stats = cache.getStats();

      expect(stats.size).toBe(1);
      expect(stats.ttlSeconds).toBe(1);
    });
  });
});
