import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const patternInsights = sqliteTable('pattern_insights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // 'sleep_focus' | 'mood_productivity' | 'energy_pinch' | 'project_abandonment' | 'time_of_day' etc.
  title: text('title').notNull(),
  description: text('description').notNull(),
  confidence: real('confidence').notNull(),    // 0-1 confidence
  dataPointCount: integer('data_points'),
  recommendation: text('recommendation'),
  correlationValue: real('correlation'),        // -1 to 1
  chartData: text('chart_data'),                // JSON string for rendering charts
  
  isNew: integer('is_new', { mode: 'boolean' }).default(true),
  isActedOn: integer('acted_on', { mode: 'boolean' }).default(false),
  
  validFrom: text('valid_from'),                // YYYY-MM-DD
  generatedAt: integer('generated_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});
