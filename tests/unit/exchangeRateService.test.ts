import { describe, it, expect, beforeEach } from '@jest/globals';
import nock from 'nock';
import { ExchangeRateService } from '../../src/domain/services/exchangeRateService.js';
import { ExternalServiceError } from '../../src/utils/errors.js';

const AWESOME_API_URL = 'https://economia.awesomeapi.com.br';

describe('ExchangeRateService', () => {
  let exchangeRateService: ExchangeRateService;

  beforeEach(() => {
    exchangeRateService = new ExchangeRateService();
    nock.cleanAll();
  });

  describe('fetchExchangeRate', () => {
    it('should fetch exchange rate successfully', async () => {
      nock(AWESOME_API_URL)
        .get('/last/USD-BRL')
        .reply(200, {
          USDBRL: {
            bid: '5.5',
            ask: '5.51',
            timestamp: 1700000000,
          },
        });

      const result = await exchangeRateService.fetchExchangeRate('USD', 'BRL');

      expect(result.rate).toBe(5.5);
      expect(result.source).toBe('AwesomeAPI');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should throw ExternalServiceError when currency pair is invalid', async () => {
      nock(AWESOME_API_URL)
        .get('/last/INVALID-PAIR')
        .reply(200, {});

      await expect(
        exchangeRateService.fetchExchangeRate('INVALID', 'PAIR'),
      ).rejects.toThrow(ExternalServiceError);
    });

    it('should throw ExternalServiceError with 404 status', async () => {
      nock(AWESOME_API_URL)
        .get('/last/XXX-YYY')
        .reply(404, { message: 'Not found' });

      await expect(
        exchangeRateService.fetchExchangeRate('XXX', 'YYY'),
      ).rejects.toThrow(ExternalServiceError);
    });

    it('should throw ExternalServiceError for network errors', async () => {
      nock(AWESOME_API_URL)
        .get('/last/USD-EUR')
        .replyWithError('Connection refused');

      await expect(
        exchangeRateService.fetchExchangeRate('USD', 'EUR'),
      ).rejects.toThrow(ExternalServiceError);
    });

    it('should throw ExternalServiceError for timeout', async () => {
      nock(AWESOME_API_URL)
        .get('/last/USD-JPY')
        .delay(10000)
        .reply(200, {
          USDJPY: {
            bid: '150.0',
            timestamp: 1700000000,
          },
        });

      await expect(
        exchangeRateService.fetchExchangeRate('USD', 'JPY'),
      ).rejects.toThrow(ExternalServiceError);
    });
  });
});
