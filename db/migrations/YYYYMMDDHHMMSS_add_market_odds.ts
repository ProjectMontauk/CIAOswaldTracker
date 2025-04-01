import { pgTable, numeric, decimal } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { markets } from "../schema";

export async function up(db: any) {
  await db.alterTable('markets')
    .addColumn('current_odds', 'numeric', (col) => col.notNull().default('0.5'))
    .addColumn('yes_amount', 'numeric', (col) => col.notNull().default('0'))
    .addColumn('no_amount', 'numeric', (col) => col.notNull().default('0'))
    .execute();

  // Change total_liquidity from decimal to numeric
  await db.alterTable('markets')
    .alterColumn('total_liquidity')
    .setDataType('numeric')
    .execute();
}

export async function down(db: any) {
  await db.alterTable('markets')
    .dropColumn('current_odds')
    .dropColumn('yes_amount')
    .dropColumn('no_amount')
    .execute();

  await db.alterTable('markets')
    .alterColumn('total_liquidity')
    .setDataType('decimal')
    .execute();
} 