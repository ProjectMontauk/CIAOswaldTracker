import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const neonUrl = "postgres://neondb_owner:npg_oMD6QV7Pgatm@ep-super-leaf-a44apuj1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
const client = postgres(neonUrl);
export const db = drizzle(client, { schema }); 