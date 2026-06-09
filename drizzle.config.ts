import type { Config } from 'drizzle-kit';

export default {
  schema: './src/main/database/schema',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './focusmind.db',
  },
} satisfies Config;
