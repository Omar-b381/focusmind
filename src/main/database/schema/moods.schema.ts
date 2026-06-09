import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const moodLogs = sqliteTable('mood_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  time: text('time').notNull(),
  mood: integer('mood').notNull(),         // 1-5
  energy: integer('energy').notNull(),     // 1-5
  focus: integer('focus').notNull(),       // 1-5
  anxiety: integer('anxiety').default(3), // 1-5
  emoji: text('emoji'),
  notes: text('notes'),
  tags: text('tags').default('[]'),
  rsdTriggered: integer('rsd', { mode: 'boolean' }).default(false),
  triggeredBy: text('triggered_by').default('manual'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
