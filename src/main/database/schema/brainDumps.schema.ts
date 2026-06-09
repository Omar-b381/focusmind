import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const brainDumps = sqliteTable('brain_dumps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  category: text('category').default('uncategorized'),
  convertedToTaskId: integer('converted_to_task_id'),
  aiSummary: text('ai_summary'),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
