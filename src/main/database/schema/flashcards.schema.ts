import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const flashcardDecks = sqliteTable('flashcard_decks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  emoji: text('emoji').default('🃏'),
  description: text('description'),
  pathId: integer('path_id'),        // Optional link to learning path

  // FSRS Settings
  targetRetention: real('target_retention').default(0.90), // 0.90 target retrievability

  totalCards: integer('total_cards').default(0),
  dueToday: integer('due_today').default(0),
  newToday: integer('new_today').default(0),
  masteredCards: integer('mastered').default(0),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const flashcards = sqliteTable('flashcards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deckId: integer('deck_id').notNull().references(() => flashcardDecks.id, { onDelete: 'cascade' }),
  pathId: integer('path_id'),
  moduleId: integer('module_id'),

  // Content
  front: text('front').notNull(),    // Question / Concept
  back: text('back').notNull(),      // Answer / Explanation
  hint: text('hint'),                // Optional hint
  tags: text('tags').default('[]'),  // JSON array
  mediaType: text('media_type').default('text'), // 'text' | 'image' | 'code' | 'math' | 'mixed'

  // FSRS State (Three Component Model)
  stability: real('stability').default(0),
  difficulty: real('difficulty').default(5),
  retrievability: real('retrievability').default(0),

  // Scheduling
  dueDate: integer('due_date', { mode: 'timestamp' }),
  lastReviewDate: integer('last_review', { mode: 'timestamp' }),
  nextInterval: integer('next_interval').default(1),  // in days
  reviewCount: integer('reviews').default(0),
  lapseCount: integer('lapses').default(0),

  // State
  state: text('state').default('new'), // 'new' | 'learning' | 'review' | 'relearning' | 'mastered'

  isAiGenerated: integer('ai_gen', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
