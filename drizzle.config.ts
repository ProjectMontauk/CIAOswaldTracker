import type { Config } from 'drizzle-kit';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'postgres',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'prediction_markets',
  },
} satisfies Config;
