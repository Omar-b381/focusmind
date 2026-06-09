import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const focusSessions = sqliteTable('focus_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id'),
  projectId: integer('project_id'),
  learningTrackId: integer('track_id'),
  lessonId: integer('lesson_id'),
  type: text('type').notNull().default('focus'), // focus, short_break, long_break, free_flow

  plannedMinutes: integer('planned_minutes').notNull(),
  actualMinutes: integer('actual_minutes'),
  microRewardsEarned: integer('micro_rewards_earned').default(0), // maps to microStarsEarned
  xpEarned: integer('xp_earned').default(0),

  // Quality metrics
  flowState: integer('flow_state', { mode: 'boolean' }).default(false),
  interrupted: integer('interrupted', { mode: 'boolean' }).default(false),
  interruptionReason: text('interruption_reason'), // backward compatibility
  interruptionCount: integer('interruption_count').default(0),
  interruptionReasons: text('interruption_reasons').default('[]'), // JSON array: ['external', 'internal', 'biological', 'digital']

  // Pre/Post metrics
  moodBefore: integer('mood_before'),
  moodAfter: integer('mood_after'),
  energyBefore: integer('energy_before'),
  energyAfter: integer('energy_after'),

  // PINCH driver
  pinchActive: text('pinch_active'), // 'P' | 'I' | 'N' | 'C' | 'H'
  notes: text('notes'),
  contextSaved: text('context_saved'),

  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  date: text('date').notNull(),
});
