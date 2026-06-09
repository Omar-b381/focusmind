import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const focusSessions = sqliteTable('focus_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id'),
  projectId: integer('project_id'),
  type: text('type').notNull().default('focus'),
  plannedMinutes: integer('planned_minutes').notNull(),
  actualMinutes: integer('actual_minutes'),
  interrupted: integer('interrupted', { mode: 'boolean' }).default(false),
  interruptionReason: text('interruption_reason'),
  moodBefore: integer('mood_before'),
  moodAfter: integer('mood_after'),
  energyBefore: integer('energy_before'),
  notes: text('notes'),
  microRewardsEarned: integer('micro_rewards_earned').default(0),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  date: text('date').notNull(),
});
