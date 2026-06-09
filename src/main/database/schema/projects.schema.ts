import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  emoji: text('emoji').default('📁'),
  color: text('color').default('#6366f1'),
  status: text('status').notNull().default('active'),
  graveyardReason: text('graveyard_reason'),
  graveyardLessons: text('graveyard_lessons'),
  totalFocusMinutes: integer('total_focus_minutes').default(0),
  taskCount: integer('task_count').default(0),
  completedTaskCount: integer('completed_task_count').default(0),
  targetDate: integer('target_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
