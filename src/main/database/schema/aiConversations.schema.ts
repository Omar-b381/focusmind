import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const aiConversations = sqliteTable('ai_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  context: text('context').notNull().default('coach'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  messages: text('messages').notNull(),
  summary: text('summary'),
  date: text('date').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
