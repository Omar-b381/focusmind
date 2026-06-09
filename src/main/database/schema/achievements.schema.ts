import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  nameAr: text('name_ar').notNull(),
  description: text('description_ar').notNull(),
  emoji: text('emoji').notNull(),
  category: text('category').notNull(), // focus, tasks, habits, learning, consistency, courage, special
  
  xpReward: integer('xp_reward').notNull().default(50),
  rarity: text('rarity').default('common'), // common, rare, epic, legendary
  condition: text('condition').notNull().default('{}'), // JSON condition
  
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }),
  isUnlocked: integer('is_unlocked', { mode: 'boolean' }).default(false),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
});
