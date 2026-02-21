import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().min(10),
  JWT_SECRET: z.string().min(20),
  AWESOME_API_URL: z.string().url().default('https://economia.awesomeapi.com.br'),
  CACHE_TTL: z.coerce.number().int().positive().default(120),
});

const parseConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('Configuration validation failed:', error.errors);
    process.exit(1);
  }
};

export const config = parseConfig();
