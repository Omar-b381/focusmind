import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const learningMaterials = sqliteTable('learning_materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'),
  filePath: text('file_path'),
  fileSize: integer('file_size'),
  fileType: text('file_type'), // 'pdf', 'txt', 'markdown', 'link', 'text_input'
  learningTrackId: integer('track_id'),
  status: text('status').notNull().default('pending'), // 'pending', 'reading', 'summarized', 'read'
  summary: text('summary'),
  conceptMap: text('concept_map'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
