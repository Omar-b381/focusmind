import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  projectId: integer('project_id'),
  learningTrackId: integer('track_id'),

  // PINCH System
  pinchScore: real('pinch_score').default(5),
  pinchPassion: real('pinch_p').default(5),
  pinchInterest: real('pinch_i').default(5),
  pinchNovelty: real('pinch_n').default(5),
  pinchChallenge: real('pinch_c').default(5),
  pinchHurry: real('pinch_h').default(5),
  pinchLastCalc: integer('pinch_calc_at', { mode: 'timestamp' }),

  // Energy & Scheduling
  energyLevel: text('energy_level').notNull().default('medium'), // low, medium, high, peak
  estimatedMinutes: integer('estimated_minutes').default(25),
  actualMinutes: integer('actual_minutes'),
  bestTimeOfDay: text('best_time').default('any'), // morning, afternoon, evening, any

  // Status & Priority
  status: text('status').notNull().default('inbox'),
  priority: text('priority').notNull().default('medium'),

  // ADHD-specific
  isMicroTask: integer('is_micro_task', { mode: 'boolean' }).default(false),
  parentTaskId: integer('parent_task_id'),
  aiBreakdown: text('ai_breakdown'), // JSON breakdown
  microSteps: text('micro_steps').default('[]'), // JSON array: { id, title, done, estimatedMin }
  
  dopamineRewardId: integer('dopamine_reward_id'),
  urgencyBoost: text('urgency_boost'),
  noveltyTwist: text('novelty_twist'),
  challengeFrame: text('challenge_frame'),

  // Context
  tags: text('tags').default('[]'),
  attachments: text('attachments').default('[]'),
  contextNotes: text('context_notes'),

  dueDate: integer('due_date', { mode: 'timestamp' }),
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
