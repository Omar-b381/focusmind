import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const noteLinks = sqliteTable('note_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceNoteId: integer('source_id').notNull(),
  targetNoteId: integer('target_id').notNull(),
  linkType: text('link_type').default('reference'),
  context: text('context'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
