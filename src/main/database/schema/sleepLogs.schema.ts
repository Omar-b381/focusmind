import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const sleepLogs = sqliteTable('sleep_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),                 // date of wake up YYYY-MM-DD
  bedTime: text('bed_time'),                    // HH:MM
  wakeTime: text('wake_time'),                  // HH:MM
  totalHours: real('total_hours'),
  quality: integer('quality'),                  // 1-5 scale
  fellAsleepMin: integer('fell_asleep'),
  
  racingThoughts: integer('racing_thoughts', { mode: 'boolean' }).default(false),
  midnightWakeups: integer('wakeups').default(0),
  medicationTaken: integer('med_taken', { mode: 'boolean' }).default(false),
  
  notes: text('notes'),
  aiInsight: text('ai_insight'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
