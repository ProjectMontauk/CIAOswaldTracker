import 'dotenv/config';
import { db } from "../db";
import { users, markets, predictions, evidence, votes } from "../db/schema";

// Add some debug logging
console.log('Environment check:', {
  DATABASE_URL: process.env.DATABASE_URL?.replace(/:.*@/, ':****@'),  // Hide password in logs
  NODE_ENV: process.env.NODE_ENV
});

async function showDatabase() {
  console.log('\n📊 DATABASE CONTENTS\n');

  console.log('👥 USERS:');
  const allUsers = await db.select().from(users);
  console.table(allUsers);

  console.log('\n🎯 MARKETS:');
  const allMarkets = await db.select().from(markets);
  console.table(allMarkets);

  console.log('\n🔮 PREDICTIONS:');
  const allPredictions = await db.select().from(predictions);
  console.table(allPredictions);

  console.log('\n📝 EVIDENCE:');
  const allEvidence = await db.select().from(evidence);
  console.table(allEvidence);

  console.log('\n👍 VOTES:');
  const allVotes = await db.select().from(votes);
  console.table(allVotes);
}

// Run the function
showDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error displaying database:', error);
    process.exit(1);
  });