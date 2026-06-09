import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { flashcards } from './flashcards.schema';

export const fsrsReviews = sqliteTable('fsrs_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: integer('card_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  deckId: integer('deck_id').notNull(),

  // Rating (1=Again, 2=Hard, 3=Good, 4=Easy)
  rating: integer('rating').notNull(),

  // Pre-review FSRS state
  prevStability: real('prev_s'),
  prevDifficulty: real('prev_d'),
  prevRetrievability: real('prev_r'),

  // Post-review FSRS state
  newStability: real('new_s'),
  newDifficulty: real('new_d'),
  newInterval: integer('new_interval'),

  // XP awarded
  xpAwarded: integer('xp').default(0),
  wasDelayedReview: integer('delayed', { mode: 'boolean' }).default(false), // 3x to 5x XP for reviews after 7+ days

  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }).notNull(),
  responseTimeMs: integer('response_ms'), // response speed in ms
  date: text('date').notNull(), // YYYY-MM-DD
});
