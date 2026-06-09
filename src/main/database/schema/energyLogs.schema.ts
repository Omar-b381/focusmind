import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const energyLogs = sqliteTable('energy_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  hour: integer('hour').notNull(),
  energyLevel: integer('energy').notNull(),
});
