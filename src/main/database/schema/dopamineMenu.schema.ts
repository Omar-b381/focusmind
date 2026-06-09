import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const dopamineActivities = sqliteTable('dopamine_activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  energyCost: text('energy_cost').notNull().default('low'),
  dopamineScore: integer('dopamine_score').notNull().default(5),
  useCount: integer('use_count').default(0),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  isCustom: integer('is_custom', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
