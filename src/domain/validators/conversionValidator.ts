import { z, ZodError } from 'zod';
import { ValidationError } from '../../utils/errors.js';

const currencyCodeSchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters');

const positiveNumberSchema = z
  .number()
  .positive('Value must be greater than 0')
  .finite('Value must be a finite number');

export const conversionRequestSchema = z.object({
  fromCurrency: currencyCodeSchema,
  toCurrency: currencyCodeSchema,
  value: positiveNumberSchema,
});

export type ConversionRequest = z.infer<typeof conversionRequestSchema>;

export function validateConversionRequest(data: unknown): ConversionRequest {
  try {
    return conversionRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Invalid conversion request', details);
    }
    throw error;
  }
}

export function validateCurrencies(fromCurrency: unknown, toCurrency: unknown): { fromCurrency: string; toCurrency: string } {
  try {
    return {
      fromCurrency: currencyCodeSchema.parse(fromCurrency),
      toCurrency: currencyCodeSchema.parse(toCurrency),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Invalid currency codes', details);
    }
    throw error;
  }
}
