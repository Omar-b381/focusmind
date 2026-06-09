import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const feynmanSessions = sqliteTable('feynman_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pathId: integer('path_id'),
  moduleId: integer('module_id'),

  concept: text('concept').notNull(),      // Concept being tested
  targetAudience: text('audience').default('مبتدئ'), // e.g., 'beginner', '10-year-old'

  // User's explanation
  explanation: text('explanation').notNull(),
  explanationDurationMs: integer('duration_ms'),

  // AI Evaluation metrics (0-100)
  aiScore: integer('ai_score'),            // overall score (average)
  aiScoreAccuracy: integer('accuracy'),    // accuracy of information
  aiScoreClarity: integer('clarity'),      // clarity/simplicity
  aiScoreDepth: integer('depth'),          // conceptual depth
  aiScoreAnalogy: integer('analogy'),      // analogy quality

  aiFeedback: text('ai_feedback'),         // detailed textual feedback
  aiGaps: text('ai_gaps'),                // JSON string array of gaps
  aiNextSteps: text('ai_next_steps'),     // suggestions for deeper study

  xpEarned: integer('xp').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
