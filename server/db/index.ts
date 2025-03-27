import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "server/db/schema";
import { users } from "server/db/schema";

if (!process.env.DATABASE_URL) {
  console.error('No DATABASE_URL found in environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL
  });
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;

// Create postgres client with native pg driver
const client = postgres(connectionString, {
  max: 1,
  onnotice: () => {}, // Suppress notice messages
  debug: (connection_id, str) => {
  },
  onconnect: () => {
  },
});

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Function to create default user if none exists
const ensureDefaultUser = async () => {
  try {
    // Check if any user exists
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
      // Create default user if none exists
      const [defaultUser] = await db
        .insert(users)
        .values({
          username: "default_user",
          password: "default_pass", // In production, use proper password hashing
          balance: "1000",
        })
        .returning();
    } else {
    }
  } catch (error) {
    console.error('Error ensuring default user:', error);
  }
};

// Test the connection and ensure default user exists
const initializeDatabase = async () => {
  try {
    await client`SELECT 1`;
    await ensureDefaultUser();
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
};

// Run initialization but don't block exports
initializeDatabase();

