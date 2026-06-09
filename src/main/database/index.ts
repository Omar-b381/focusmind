import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as schema from './schema';
import { initFallbackDatabase } from './fallback';

let db: any = null;
let sqlite: any = null;
let useFallback = false;

export function initDatabase(): any {
  if (db) return db;

  try {
    // Try to dynamically require better-sqlite3 and drizzle-orm
    const Database = require('better-sqlite3');
    const { drizzle } = require('drizzle-orm/better-sqlite3');

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
    console.log('Database initialized successfully with SQLite + Drizzle.');
    return db;
  } catch (e) {
    console.warn('Failed to initialize better-sqlite3 native database. Falling back to JSON database:', e);
    useFallback = true;
    initFallbackDatabase();
    db = {}; // Empty object as db handle
    return db;
  }
}

export function getDatabase(): any {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function isFallbackDatabase(): boolean {
  return useFallback;
}

export function closeDatabase(): void {
  if (sqlite) {
    try {
      sqlite.close();
    } catch (e) {
      console.error('Error closing SQLite database:', e);
    }
  }
}

export type AppDatabase = any;
