import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const bodyDoubleSessions = sqliteTable('body_double_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  focusSessionId: integer('focus_session_id'),
  
  personaName: text('persona').notNull().default('مرافق'), // 'مرافق' | 'مرشد' | 'أستاذ' | 'صديق'
  ambientType: text('ambient').notNull().default('subtle'), // 'silent' | 'subtle' | 'active'
  soundscape: text('soundscape').default('none'), // rain, lofi, etc.
  checkInIntervalMin: integer('check_in_interval').default(10),
  voiceEnabled: integer('voice', { mode: 'boolean' }).default(false),
  
  plannedMinutes: integer('planned_min').notNull(),
  actualMinutes: integer('actual_min'),
  checkInsCount: integer('check_ins').default(0),
  driftDetectedCount: integer('drifts').default(0),
  affirmationsGiven: text('affirmations').default('[]'), // JSON list of string texts
  
  taskCompleted: integer('completed', { mode: 'boolean' }).default(false),
  userRating: integer('rating'), // 1-5
  
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  date: text('date').notNull(),
});
