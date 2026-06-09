import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const dopamineLogs = sqliteTable('dopamine_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  activityId: integer('activity_id').notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }).notNull(),
  moodBefore: integer('mood_before'),
  moodAfter: integer('mood_after'),
  notes: text('notes'),
  date: text('date').notNull(),
});
