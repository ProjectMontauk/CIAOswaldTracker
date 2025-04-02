import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const marketOddsHistory = pgTable("market_odds_history", {
  id: serial("id").primaryKey(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  yesOdds: numeric("yes_odds").notNull(),
  noOdds: numeric("no_odds").notNull(),
  yesAmount: numeric("yes_amount").notNull(),
  noAmount: numeric("no_amount").notNull(),
  totalLiquidity: numeric("total_liquidity").notNull(),
});

export async function up(db) {
  await db.schema.createTable(marketOddsHistory);
}

export async function down(db) {
  await db.schema.dropTable(marketOddsHistory);
} 