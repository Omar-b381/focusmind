import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const learningPaths = sqliteTable('learning_paths', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  emoji: text('emoji').default('📚'),
  description: text('description'),
  goal: text('goal'),

  // Source
  source: text('source'),            // 'youtube' | 'udemy' | 'book' | 'articles' | 'ai_generated' | 'custom'
  sourceUrl: text('source_url'),

  // AI-Generated Path
  isAiGenerated: integer('ai_generated', { mode: 'boolean' }).default(false),
  aiRoadmap: text('ai_roadmap'),     // JSON string
  difficulty: text('difficulty').default('beginner'), // 'beginner' | 'intermediate' | 'advanced'

  // Learning style adaptation
  learningStyle: text('learning_style').default('mixed'), // 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed'

  // Structure
  totalModules: integer('total_modules').default(0),
  completedModules: integer('done_modules').default(0),
  currentModuleId: integer('current_module'),
  lastPosition: text('last_position'),

  // Anti-abandonment
  dailyGoalMinutes: integer('daily_goal').default(20),
  whyStarted: text('why_started'),
  commitment: text('commitment'),
  abandonmentRisk: real('abandon_risk').default(0), // 0 to 1

  // FSRS Integration
  flashcardDeckId: integer('deck_id'),

  // Status
  status: text('status').notNull().default('active'), // 'active' | 'paused' | 'completed' | 'parked'

  // Stats
  totalStudyMinutes: integer('total_minutes').default(0),
  currentStreakDays: integer('streak').default(0),
  longestStreakDays: integer('best_streak').default(0),
  lastStudiedAt: integer('last_studied', { mode: 'timestamp' }),
  xpEarned: integer('xp_earned').default(0),
  pinchScore: real('pinch_score').default(5),
  retentionScore: real('retention').default(0), // 0 to 100

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
