import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create postgres client with native pg driver
const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: false,  // Changed from true to false for local development
});

// Test connection
/*
const testConnection = async () => {
  try {
    const result = await client`SELECT 1`;
    console.log('✅ Database connected successfully');
    
    // Add this to check for evidence
    const evidenceCount = await client`SELECT COUNT(*) FROM evidence`;
    console.log('📊 Evidence count:', evidenceCount);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
*/
// Only run in development
if (process.env.NODE_ENV === 'development') {
  // testMarketInsert();  // Still commented out, but could be enabled for testing
}

// testConnection();

/*
const testTableStructure = async () => {
  try {
    const columns = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'votes'
    `;
    console.log('📊 Votes table structure:', columns);
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
};
*/
// testTableStructure();

/* 
const testMarketInsert = async () => {
  try {
    const result = await client`
      INSERT INTO markets (
        title, 
        description, 
        created_at, 
        starting_odds,
        creator_id,
        participants,
        total_liquidity
      )
      VALUES (
        'Test Market', 
        'Test Description', 
        NOW(),
        0.5,
        1,
        0,
        '0'
      )
      RETURNING *
    `;
    console.log('✅ Test market insert successful:', result);
  } catch (error) {
    console.error('❌ Test market insert failed:', error);
  }
};
*/
export const db = drizzle(client, { schema });