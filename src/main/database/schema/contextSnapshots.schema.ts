import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const contextSnapshots = sqliteTable('context_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id'),
  projectId: integer('project_id'),
  learningTrackId: integer('track_id'),
  snapshot: text('snapshot').notNull(), // JSON string representing context details
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
