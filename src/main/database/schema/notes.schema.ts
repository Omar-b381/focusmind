import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  tags: text('tags').default('[]'),
  emoji: text('emoji').default('📝'),
  color: text('color'),
  linkedTaskId: integer('task_id'),
  linkedProjectId: integer('project_id'),
  linkedPathId: integer('path_id'),
  linkedModuleId: integer('module_id'),
  area: text('area').default('uncategorized'), // 'projects' | 'areas' | 'resources' | 'archive'
  aiSummary: text('ai_summary'),
  aiKeywords: text('ai_keywords').default('[]'),
  embeddingHash: text('embedding_hash'),
  searchContent: text('search_content'),
  wordCount: integer('word_count').default(0),
  isArchived: integer('archived', { mode: 'boolean' }).default(false),
  isPinned: integer('pinned', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
