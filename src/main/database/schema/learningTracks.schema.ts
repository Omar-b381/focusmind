import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const learningTracks = sqliteTable('learning_tracks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  emoji: text('emoji').default('📚'),
  description: text('description'),
  source: text('source'),
  sourceUrl: text('source_url'),

  // Structure
  totalLessons: integer('total_lessons').notNull().default(1),
  completedLessons: integer('done_lessons').default(0),
  currentLesson: integer('current_lesson').default(1),
  currentLessonTitle: text('current_lesson_title'),
  lastPosition: text('last_position'),

  // ADHD anti-abandonment
  dailyGoalMinutes: integer('daily_goal_min').default(20),
  whyStarted: text('why_started'),
  commitment: text('commitment'),

  status: text('status').notNull().default('active'),

  // Streaks
  currentStreakDays: integer('current_streak').default(0),
  longestStreakDays: integer('longest_streak').default(0),
  lastStudiedAt: integer('last_studied', { mode: 'timestamp' }),

  // Stats
  totalStudyMinutes: integer('total_minutes').default(0),
  xpEarned: integer('xp_earned').default(0),
  pinchScore: real('pinch_score').default(5),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const learningLessons = sqliteTable('learning_lessons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackId: integer('track_id').notNull().references(() => learningTracks.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  title: text('title').notNull(),
  estimatedMinutes: integer('estimated_min').default(20),
  actualMinutes: integer('actual_min'),
  status: text('status').default('pending'),
  // 'pending' | 'in_progress' | 'done' | 'skipped'
  notes: text('notes'),
  keyPoints: text('key_points'), // JSON array of points
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
