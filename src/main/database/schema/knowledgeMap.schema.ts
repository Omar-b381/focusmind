import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const knowledgeNodes = sqliteTable('knowledge_nodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pathId: integer('path_id'),
  concept: text('concept').notNull(),
  description: text('description'),
  mastery: real('mastery').default(0),    // 0 to 1 mastery level
  connections: text('connections').default('[]'), // JSON array of connected concept node IDs
  x: real('x').default(0),               // visual position coordinates
  y: real('y').default(0),
  color: text('color').default('#6366f1'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
