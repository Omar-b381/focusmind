import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const learningAnalytics = sqliteTable('learning_analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // YYYY-MM-DD
  pathId: integer('path_id'),
  focusMinutes: integer('focus_minutes').default(0),
  cardsReviewed: integer('cards_reviewed').default(0),
  feynmanSessionsCount: integer('feynman_sessions_count').default(0),
  avgFeynmanScore: real('avg_feynman_score').default(0),
});
