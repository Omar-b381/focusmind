import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const moodLogs = sqliteTable('mood_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  time: text('time').notNull(),
  mood: integer('mood').notNull(),
  energy: integer('energy').notNull(),
  focus: integer('focus').notNull(),
  emoji: text('emoji'),
  notes: text('notes'),
  tags: text('tags').default('[]'),
  triggeredBy: text('triggered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
