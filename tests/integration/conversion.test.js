import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import nock from 'nock';
import app from '../../src/app.js';
import { cacheManager } from '../../src/data-access/cache.js';
import { generateJWT } from '../../src/entry-points/middleware/authentication.js';

const API_KEY = 'test_api_key_123456789';
const AWESOME_API_URL = 'https://economia.awesomeapi.com.br';

describe('Conversion API Integration Tests', () => {
  let token;

  beforeAll(() => {
    token = generateJWT({ sub: 'test-user', role: 'user' });
    cacheManager.clear();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('Authentication', () => {
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should accept request with API Key', async () => {
      nock(AWESOME_API_URL)
        .get('/last/USD-BRL')
        .reply(200, {
          USDBRL: {
            bid: '5.5',
            ask: '5.51',
            timestamp: Math.floor(Date.now() / 1000),
          },
        });

      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('convertedValue');
    });

    it('should accept request with JWT token', async () => {
      nock(AWESOME_API_URL)
        .get('/last/USD-BRL')
        .reply(200, {
          USDBRL: {
            bid: '5.5',
            ask: '5.51',
            timestamp: Math.floor(Date.now() / 1000),
          },
        });

      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Conversion', () => {
    it('should convert currencies successfully', async () => {
      nock(AWESOME_API_URL)
        .get('/last/USD-EUR')
        .reply(200, {
          USDEUR: {
            bid: '0.92',
            ask: '0.93',
            timestamp: Math.floor(Date.now() / 1000),
          },
        });

      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          value: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('convertedValue', 92);
      expect(response.body.data.source).toBe('AwesomeAPI');
      expect(response.body.data.rate).toBe(0.92);
    });

    it('should return same value for same currency', async () => {
      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'USD',
          toCurrency: 'USD',
          value: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.convertedValue).toBe(100);
      expect(response.body.data.rate).toBe(1);
      expect(response.body.data.source).toBe('SAME_CURRENCY');
    });

    it('should validate currency codes', async () => {
      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'INVALID',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate positive values', async () => {
      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: -100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Cache', () => {
    it('should use cache for second request', async () => {
      nock(AWESOME_API_URL)
        .get('/last/GBP-JPY')
        .reply(200, {
          GBPJPY: {
            bid: '150.0',
            ask: '151.0',
            timestamp: Math.floor(Date.now() / 1000),
          },
        });

      //primeiro request (da api)
      const response1 = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'GBP',
          toCurrency: 'JPY',
          value: 100,
        });

      expect(response1.body.data.source).toBe('AwesomeAPI');

      //segundo request (do cache)
      const response2 = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'GBP',
          toCurrency: 'JPY',
          value: 100,
        });

      expect(response2.body.data.source).toBe('CACHE');
      expect(response2.body.data.rate).toBe(response1.body.data.rate);
    });
  });

  describe('Health Check', () => {
    it('should return health status without authentication', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('External API Error Handling', () => {
    it('should handle external API errors gracefully', async () => {
      nock(AWESOME_API_URL)
        .get('/last/XXX-YYY')
        .reply(404, { message: 'Currency not found' });

      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fromCurrency: 'XXX',
          toCurrency: 'YYY',
          value: 100,
        });

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });
  });
});
