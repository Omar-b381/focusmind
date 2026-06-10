import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const commitments = sqliteTable('commitments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),                 // 'learning' | 'habit' | 'project' | 'daily_routine' | 'custom'
  
  // The contract details
  commitment: text('commitment').notNull(),
  whyItMatters: text('why_matters'),
  obstaclesPlan: text('obstacles_plan'),
  rewardPlan: text('reward_plan'),
  
  // Relations
  linkedPathId: integer('path_id'),
  linkedHabitId: integer('habit_id'),
  linkedProjectId: integer('project_id'),
  
  // Duration & Scheduling
  startDate: text('start_date').notNull(),      // YYYY-MM-DD
  endDate: text('end_date'),                    // YYYY-MM-DD
  durationDays: integer('duration_days'),
  
  // Progress & Status
  status: text('status').default('active'),     // 'active' | 'completed' | 'broken' | 'renewed'
  streak: integer('streak').default(0),
  completionRate: real('completion_rate').default(0), // percentage 0-100
  
  // AI Coaching integrations
  aiCheckinEnabled: integer('ai_checkin', { mode: 'boolean' }).default(true),
  lastCheckin: integer('last_checkin', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
