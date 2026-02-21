import { describe, it, expect } from '@jest/globals';
import { validateConversionRequest, validateCurrencies } from '../../src/domain/validators/conversionValidator.js';
import { ValidationError } from '../../src/utils/errors.js';

describe('ConversionValidator', () => {
  describe('validateConversionRequest', () => {
    it('should validate correct conversion request', () => {
      const request = {
        fromCurrency: 'USD',
        toCurrency: 'BRL',
        value: 100,
      };

      const result = validateConversionRequest(request);
      expect(result).toEqual(request);
    });

    it('should throw ValidationError for invalid currency code', () => {
      const request = {
        fromCurrency: 'USDA', //4 caracteres
        toCurrency: 'BRL',
        value: 100,
      };

      expect(() => validateConversionRequest(request)).toThrow(ValidationError);
    });

    it('should throw ValidationError for negative value', () => {
      const request = {
        fromCurrency: 'USD',
        toCurrency: 'BRL',
        value: -100,
      };

      expect(() => validateConversionRequest(request)).toThrow(ValidationError);
    });

    it('should throw ValidationError for zero value', () => {
      const request = {
        fromCurrency: 'USD',
        toCurrency: 'BRL',
        value: 0,
      };

      expect(() => validateConversionRequest(request)).toThrow(ValidationError);
    });

    it('should throw ValidationError for lowercase currency codes', () => {
      const request = {
        fromCurrency: 'usd',
        toCurrency: 'brl',
        value: 100,
      };

      expect(() => validateConversionRequest(request)).toThrow(ValidationError);
    });
  });

  describe('validateCurrencies', () => {
    it('should validate correct currency codes', () => {
      const result = validateCurrencies('USD', 'BRL');
      expect(result).toEqual({
        fromCurrency: 'USD',
        toCurrency: 'BRL',
      });
    });

    it('should throw ValidationError for invalid currency code', () => {
      expect(() => validateCurrencies('US', 'BRL')).toThrow(ValidationError);
      expect(() => validateCurrencies('USD123', 'BRL')).toThrow(ValidationError);
    });
  });
});
