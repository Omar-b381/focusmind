import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const xpLedger = sqliteTable('xp_ledger', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  referenceId: integer('ref_id'),
  referenceType: text('ref_type'),
  totalAfter: integer('total_after').notNull(),
  date: text('date').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
