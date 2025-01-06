import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  reputation: integer("reputation").notNull().default(0),
  upvotesReceived: integer("upvotes_received").notNull().default(0),
  downvotesReceived: integer("downvotes_received").notNull().default(0),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  probability: integer("probability").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  text: text("text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  evidenceId: integer("evidence_id").references(() => evidence.id).notNull(),
  isUpvote: boolean("is_upvote").notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  evidence: many(evidence),
  votes: many(votes),
  predictions: many(predictions),
}));

export const evidenceRelations = relations(evidence, ({ one, many }) => ({
  user: one(users, {
    fields: [evidence.userId],
    references: [users.id],
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
}));

// Types
export type User = typeof users.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type Vote = typeof votes.$inferSelect;