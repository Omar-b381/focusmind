import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  projectId: integer('project_id'),
  energyLevel: text('energy_level').notNull().default('medium'),
  estimatedMinutes: integer('estimated_minutes').default(25),
  actualMinutes: integer('actual_minutes'),
  priority: text('priority').notNull().default('medium'),
  status: text('status').notNull().default('inbox'),
  isMicroTask: integer('is_micro_task', { mode: 'boolean' }).default(false),
  parentTaskId: integer('parent_task_id'),
  dopamineRewardId: integer('dopamine_reward_id'),
  aiBreakdown: text('ai_breakdown'),
  tags: text('tags').default('[]'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
