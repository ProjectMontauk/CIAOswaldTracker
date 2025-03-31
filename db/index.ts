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

// Add this test query
const testMarketInsert = async () => {
  try {
    const result = await client`
      INSERT INTO markets (
        title, 
        description, 
        created_at, 
        starting_odds,    -- Required field
        creator_id,       -- Required field
        participants,     -- Has default
        total_liquidity  -- Has default
      )
      VALUES (
        'Test Market', 
        'Test Description', 
        NOW(),
        0.5,             -- Starting odds (50%)
        1,               -- Default creator ID
        0,               -- Default participants
        '0'              -- Default total liquidity
      )
      RETURNING *
    `;
    console.log('✅ Test market insert successful:', result);
  } catch (error) {
    console.error('❌ Test market insert failed:', error);
  }
};

testConnection();
testMarketInsert();

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

testTableStructure();

export const db = drizzle(client, { schema });