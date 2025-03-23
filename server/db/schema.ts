import { integer, pgTable, serial, text, timestamp, unique, relations } from "drizzle-orm/pg-core";
import { users } from './users';

export const evidence = pgTable('evidence', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  marketId: integer('market_id'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  text: text('text'),
  evidenceType: text('evidence_type').notNull(),
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  evidenceId: integer('evidence_id').notNull(),
  value: integer('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userEvidenceUnique: unique().on(table.userId, table.evidenceId),
}));

// Define relations
export const evidenceRelations = relations(evidence, ({ many }) => ({
  votes: many(votes),
}));

export type Evidence = typeof evidence.$inferSelect;
export type Vote = typeof votes.$inferSelect; 