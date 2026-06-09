import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  emoji: text('emoji').notNull(),
  category: text('category').notNull(),
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }),
  isUnlocked: integer('is_unlocked', { mode: 'boolean' }).default(false),
});
