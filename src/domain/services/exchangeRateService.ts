import axios from 'axios';
import { ExternalServiceError } from '../../utils/errors.js';
import { config } from '../../config/index.js';

export interface ExchangeRateData {
  rate: number;
  timestamp: Date;
  source: string;
}

export class ExchangeRateService {
  private readonly axiosInstance: ReturnType<typeof axios.create>;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.AWESOME_API_URL,
      timeout: 5000,
      headers: {
        'User-Agent': 'Conversor-Monetario/1.0',
      },
    });
  }

  async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateData> {
    try {
      console.log(`[INFO] Fetching exchange rate: ${fromCurrency} -> ${toCurrency}`);

      const response = await this.axiosInstance.get<Record<string, { bid: string; timestamp: number }>>(
        `/last/${fromCurrency}-${toCurrency}`,
      );

      const key = `${fromCurrency}${toCurrency}`;
      const rateData = response.data[key];

      if (!rateData) {
        throw new Error('Invalid currency pair');
      }

      return {
        rate: parseFloat(rateData.bid),
        timestamp: new Date(rateData.timestamp * 1000),
        source: 'AwesomeAPI',
      };
    } catch (error) {
      const axiosError = error as { message?: string; response?: { status?: number } };
      console.error(`[ERROR] Failed to fetch exchange rate: ${axiosError.message}`);

      if (axiosError.response?.status === 404) {
        throw new ExternalServiceError(
          'Currency pair not found or unavailable',
          { originalError: axiosError.message },
        );
      }

      throw new ExternalServiceError(
        'Failed to fetch exchange rates. Please try again later.',
        { originalError: axiosError.message },
      );
    }
  }
}

export const exchangeRateService = new ExchangeRateService();
