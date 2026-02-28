import { cacheManager } from '../../data-access/cache.js';
import { exchangeRateService, ExchangeRateData } from './exchangeRateService.js';
import { validateConversionRequest } from '../validators/conversionValidator.js';

export interface ConversionRequest {
  fromCurrency: string;
  toCurrency: string;
  value: number;
}

export interface ConversionResult {
  fromCurrency: string;
  toCurrency: string;
  value: number;
  convertedValue: number;
  rate: number;
  source: string;
  timestamp: Date;
}

export class ConversionService {
  async convert(fromCurrency: string, toCurrency: string, value: number | string): Promise<ConversionResult> {
    //valida entrada das moeda
    const validated = validateConversionRequest({
      fromCurrency,
      toCurrency,
      value: typeof value === 'string' ? parseFloat(value) : value,
    });

    //verifica se é a mesma moeda
    if (validated.fromCurrency === validated.toCurrency) {
      console.log(`[INFO] Same currency conversion: ${fromCurrency}`);
      return {
        fromCurrency: validated.fromCurrency,
        toCurrency: validated.toCurrency,
        value: validated.value,
        convertedValue: validated.value,
        rate: 1,
        source: 'SAME_CURRENCY',
        timestamp: new Date(),
      };
    }

    //tenta buscar do cache primeiro
    const cachedRate = cacheManager.get(
      validated.fromCurrency,
      validated.toCurrency,
    ) as ExchangeRateData | null;

    let exchangeData: ExchangeRateData;
    let source: string;

    if (!cachedRate) {
      //faz a busca da API
      exchangeData = await exchangeRateService.fetchExchangeRate(
        validated.fromCurrency,
        validated.toCurrency,
      );
      source = exchangeData.source;

      //armazena no cache
      cacheManager.set(
        validated.fromCurrency,
        validated.toCurrency,
        exchangeData,
      );
    } else {
      exchangeData = cachedRate;
      source = 'CACHE';
    }

    const convertedValue = validated.value * exchangeData.rate;

    console.log(`[INFO] Conversion: ${validated.value} ${validated.fromCurrency} -> ${parseFloat(convertedValue.toFixed(2))} ${validated.toCurrency} (source: ${source})`);

    return {
      fromCurrency: validated.fromCurrency,
      toCurrency: validated.toCurrency,
      value: validated.value,
      convertedValue: parseFloat(convertedValue.toFixed(2)),
      rate: exchangeData.rate,
      source,
      timestamp: exchangeData.timestamp,
    };
  }
}

export const conversionService = new ConversionService();
