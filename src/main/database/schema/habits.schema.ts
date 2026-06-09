import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  emoji: text('emoji').default('✅'),
  description: text('description'),
  type: text('type').notNull().default('build'),
  frequency: text('frequency').notNull().default('daily'),
  targetDays: text('target_days').default('[1,2,3,4,5,6,0]'),
  reminderTime: text('reminder_time'),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  totalCompletions: integer('total_completions').default(0),
  energyRequired: text('energy_required').default('low'),
  dopamineBoost: integer('dopamine_boost').default(5),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id').notNull(),
  date: text('date').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull(),
  notes: text('notes'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
