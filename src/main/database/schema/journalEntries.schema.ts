import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),                // YYYY-MM-DD
  type: text('type').notNull().default('free'), // 'morning' | 'evening' | 'free' | 'shame_breaker' | 'decision'
  content: text('content').notNull(),
  prompt: text('prompt'),
  
  // Plutchik's Emotion Wheel variables
  primaryEmotion: text('primary_emotion'),
  secondaryEmotion: text('secondary_emotion'),
  emotionIntensity: integer('intensity'),      // 1-5
  emotionColor: text('emotion_color'),
  
  // Environmental context
  energyAtWrite: integer('energy'),            // 1-5
  moodAtWrite: integer('mood'),                // 1-5
  sleepLastNight: real('sleep_hours'),
  
  // AI Coaching analyses
  aiInsights: text('ai_insights'),
  aiDetectedPatterns: text('patterns'),        // JSON string of patterns
  aiShameLevel: integer('shame_level'),        // 1-5 scale
  aiActionSuggested: text('ai_action'),        // Small actionable step
  
  relatedNoteId: integer('note_id'),
  xpEarned: integer('xp').default(5),
  wordCount: integer('word_count').default(0),
  durationMinutes: integer('duration_min'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
