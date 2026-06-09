import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const userProfile = sqliteTable('user_profile', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().default('المستخدم'),
  avatar: text('avatar'),                  // emoji or initials
  level: integer('level').notNull().default(1),
  totalXP: integer('total_xp').notNull().default(0),
  currentStreakDays: integer('current_streak').default(0),
  longestStreakDays: integer('longest_streak').default(0),
  pinchProfile: text('pinch_profile').default('{}'),
  // JSON: { p: 7, i: 8, n: 6, c: 5, h: 9 }
  peakHour: integer('peak_hour').default(10),
  avgDailyEnergy: real('avg_daily_energy').default(3),
  onboardingCompleted: integer('onboarding_done', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
