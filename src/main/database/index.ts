import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as schema from './schema';

let db: ReturnType<typeof drizzle>;
let sqlite: Database.Database;

export function initDatabase(): ReturnType<typeof drizzle> {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbDir = join(userDataPath, 'data');

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = join(dbDir, 'focusmind.db');
  sqlite = new Database(dbPath);

  // Enable WAL mode for better performance
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  db = drizzle(sqlite, { schema });
  return db;
}

export function getDatabase(): ReturnType<typeof drizzle> {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close();
  }
}

export type AppDatabase = ReturnType<typeof drizzle>;
