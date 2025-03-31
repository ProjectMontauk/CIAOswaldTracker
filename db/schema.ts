import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  reputation: integer("reputation").notNull().default(0),
  upvotesReceived: integer("upvotes_received").notNull().default(0),
  downvotesReceived: integer("downvotes_received").notNull().default(0),
  balance: decimal("balance").notNull().default("1000"), // Starting balance for betting
});

export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  initialEvidence: text("initial_evidence"),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  participants: integer("participants").notNull().default(0),
  totalLiquidity: decimal("total_liquidity").notNull().default("0"),
  yesResolution: text("yes_resolution"),
  noResolution: text("no_resolution"),
  yesOdds: decimal("yes_odds").notNull().default("0.5"),
  noOdds: decimal("no_odds").notNull().default("0.5"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  probability: decimal("probability").notNull(),
  amount: decimal("amount").notNull(),
  position: text("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  marketId: integer("market_id").references(() => markets.id), 
  title: text("title").notNull(),
  content: text("content").notNull(),
  text: text("text"),
  evidenceType: text("evidence_type").notNull().default('yes'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  url: text("url"),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  evidenceId: integer("evidence_id").references(() => evidence.id).notNull(),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  evidence: many(evidence),
  votes: many(votes),
  predictions: many(predictions),
  markets: many(markets),
}));

export const marketRelations = relations(markets, ({ many, one }) => ({
  predictions: many(predictions),
  evidence: many(evidence),
  creator: one(users, {
    fields: [markets.creatorId],
    references: [users.id],
  }),
}));

export const evidenceRelations = relations(evidence, ({ one, many }) => ({
  user: one(users, {
    fields: [evidence.userId],
    references: [users.id],
  }),
  market: one(markets, {
    fields: [evidence.marketId],
    references: [markets.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  evidence: one(evidence, {
    fields: [votes.evidenceId],
    references: [evidence.id],
  }),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
  market: one(markets, {
    fields: [predictions.marketId],
    references: [markets.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Market = typeof markets.$inferSelect;