import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import nock from 'nock';
import app from '../../src/app.js';
import { generateJWT } from '../../src/entry-points/middleware/authentication.js';

const API_KEY = 'test_api_key_123456789';

describe('Authentication Middleware', () => {
  let token;

  beforeEach(() => {
    token = generateJWT({ sub: 'test-user', role: 'user' });
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('Authorization header validation', () => {
    it('should reject request without authorization header', async () => {
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

    it('should reject request with invalid header format (no scheme)', async () => {
      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', 'invalidformat')
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with wrong scheme (not bearer)', async () => {
      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', 'Basic dXNlcjpwYXNz')
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with invalid JWT token', async () => {
      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with expired JWT token', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredToken = jwt.default.sign(
        { sub: 'test-user' },
        'test_jwt_secret_key_123456789',
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .post('/api/convert')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          fromCurrency: 'USD',
          toCurrency: 'BRL',
          value: 100,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should accept request with valid API Key', async () => {
      nock('https://economia.awesomeapi.com.br')
        .get('/last/USD-BRL')
        .reply(200, {
          USDBRL: { bid: '5.5', timestamp: 1700000000 },
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
    });

    it('should accept request with valid JWT token', async () => {
      nock('https://economia.awesomeapi.com.br')
        .get('/last/USD-BRL')
        .reply(200, {
          USDBRL: { bid: '5.5', timestamp: 1700000000 },
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
});
