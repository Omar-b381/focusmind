import { getDatabase } from './index';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

export function runMigrations(): void {
  const db = getDatabase();

  // Create tables if not exist
  db.run(sql`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL,
    updated_at INTEGER
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    project_id INTEGER,
    energy_level TEXT NOT NULL DEFAULT 'medium',
    estimated_minutes INTEGER DEFAULT 25,
    actual_minutes INTEGER,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'inbox',
    is_micro_task INTEGER DEFAULT 0,
    parent_task_id INTEGER,
    dopamine_reward_id INTEGER,
    ai_breakdown TEXT,
    tags TEXT DEFAULT '[]',
    due_date INTEGER,
    completed_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '📁',
    color TEXT DEFAULT '#6366f1',
    status TEXT NOT NULL DEFAULT 'active',
    graveyard_reason TEXT,
    graveyard_lessons TEXT,
    total_focus_minutes INTEGER DEFAULT 0,
    task_count INTEGER DEFAULT 0,
    completed_task_count INTEGER DEFAULT 0,
    target_date INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER,
    completed_at INTEGER
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    project_id INTEGER,
    type TEXT NOT NULL DEFAULT 'focus',
    planned_minutes INTEGER NOT NULL,
    actual_minutes INTEGER,
    interrupted INTEGER DEFAULT 0,
    interruption_reason TEXT,
    mood_before INTEGER,
    mood_after INTEGER,
    energy_before INTEGER,
    notes TEXT,
    micro_rewards_earned INTEGER DEFAULT 0,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    date TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '✅',
    description TEXT,
    type TEXT NOT NULL DEFAULT 'build',
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_days TEXT DEFAULT '[1,2,3,4,5,6,0]',
    reminder_time TEXT,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    energy_required TEXT DEFAULT 'low',
    dopamine_boost INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL,
    notes TEXT,
    completed_at INTEGER
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS brain_dumps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'uncategorized',
    converted_to_task_id INTEGER,
    ai_summary TEXT,
    is_archived INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS dopamine_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    energy_cost TEXT NOT NULL DEFAULT 'low',
    dopamine_score INTEGER NOT NULL DEFAULT 5,
    use_count INTEGER DEFAULT 0,
    last_used_at INTEGER,
    is_custom INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS mood_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    mood INTEGER NOT NULL,
    energy INTEGER NOT NULL,
    focus INTEGER NOT NULL,
    emoji TEXT,
    notes TEXT,
    tags TEXT DEFAULT '[]',
    triggered_by TEXT,
    created_at INTEGER NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    context TEXT NOT NULL DEFAULT 'coach',
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    messages TEXT NOT NULL,
    summary TEXT,
    date TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL,
    category TEXT NOT NULL,
    unlocked_at INTEGER,
    is_unlocked INTEGER DEFAULT 0
  )`);

  // Seed default data
  seedDopamineActivities();
  seedAchievements();
}

function seedDopamineActivities(): void {
  const db = getDatabase();
  const count = db.select({ count: sql<number>`count(*)` }).from(schema.dopamineActivities).get();
  if (count && count.count > 0) return;

  const now = new Date();
  const activities = [
    { name: 'مشي 5 دقائق', emoji: '🚶', description: 'تمشي شوية لتنشيط الدورة الدموية', category: 'movement', durationMinutes: 5, energyCost: 'low', dopamineScore: 7 },
    { name: 'اشرب كوب ماء', emoji: '💧', description: 'اشرب كوب ماء بارد — بسيطة وفعالة', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 4 },
    { name: 'اسمع أغنية محببة', emoji: '🎵', description: 'أغنية وحدة تحبها', category: 'sensory', durationMinutes: 5, energyCost: 'low', dopamineScore: 8 },
    { name: 'شوف فيديو مضحك', emoji: '📱', description: 'فيديو واحد بس — لا أكثر!', category: 'creative', durationMinutes: 5, energyCost: 'low', dopamineScore: 7 },
    { name: 'تنفس عميق', emoji: '🧘', description: '5 أنفاس عميقة بتهدي الجهاز العصبي', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 5 },
    { name: 'ارسم عشوائياً', emoji: '✍️', description: 'ارسم أي حاجة عشوائية على ورقة', category: 'creative', durationMinutes: 10, energyCost: 'medium', dopamineScore: 6 },
    { name: 'انظر للطبيعة', emoji: '🌿', description: 'بص من الشباك على الأشجار أو السماء', category: 'nature', durationMinutes: 2, energyCost: 'low', dopamineScore: 5 },
    { name: 'العب لعبة صغيرة', emoji: '🎮', description: 'لعبة بازل أو لعبة خفيفة — 10 دقائق بس', category: 'achievement', durationMinutes: 10, energyCost: 'medium', dopamineScore: 8 },
  ];

  for (const activity of activities) {
    db.insert(schema.dopamineActivities).values({
      ...activity,
      isCustom: false,
      useCount: 0,
      createdAt: now,
    } as any).run();
  }
}

function seedAchievements(): void {
  const db = getDatabase();
  const count = db.select({ count: sql<number>`count(*)` }).from(schema.achievements).get();
  if (count && count.count > 0) return;

  const achievementsList = [
    { key: 'first_focus', name: 'البداية الأولى', description: 'أكملت أول جلسة تركيز', emoji: '🌟', category: 'focus' },
    { key: 'focus_30', name: 'نصف ساعة ذهبية', description: '30 دقيقة تركيز متواصل', emoji: '⏱️', category: 'focus' },
    { key: 'focus_60', name: 'ساعة كاملة!', description: '60 دقيقة تركيز في يوم واحد', emoji: '🔥', category: 'focus' },
    { key: 'task_1', name: 'أول إنجاز', description: 'أكملت أول مهمة', emoji: '✅', category: 'tasks' },
    { key: 'task_10', name: 'عشر مهام!', description: 'أكملت 10 مهام', emoji: '🎯', category: 'tasks' },
    { key: 'task_50', name: 'ماكينة إنجاز', description: 'أكملت 50 مهمة', emoji: '🏆', category: 'tasks' },
    { key: 'streak_3', name: '3 أيام متتالية', description: '3 أيام استخدام متواصل', emoji: '🔥', category: 'consistency' },
    { key: 'streak_7', name: 'أسبوع كامل!', description: '7 أيام متتالية', emoji: '💎', category: 'consistency' },
    { key: 'streak_30', name: 'شهر من الالتزام', description: '30 يوم متتالي — أنت بطل', emoji: '👑', category: 'consistency' },
    { key: 'habit_first', name: 'عادة جديدة', description: 'أكملت عادة لأول مرة', emoji: '🌱', category: 'habits' },
    { key: 'habit_streak_7', name: 'أسبوع عادات', description: 'حافظت على عادة 7 أيام', emoji: '🌿', category: 'habits' },
    { key: 'brain_dump_5', name: 'تفريغ العقل', description: 'كتبت 5 brain dumps', emoji: '🧠', category: 'courage' },
    { key: 'graveyard_first', name: 'شجاعة الاعتراف', description: 'علّقت مشروع رسمياً — ده شجاعة مش فشل', emoji: '🎖️', category: 'courage' },
    { key: 'dopamine_first', name: 'مكافأة ذكية', description: 'استخدمت قائمة الدوبامين لأول مرة', emoji: '🍊', category: 'courage' },
    { key: 'ai_chat_first', name: 'أول محادثة', description: 'تكلمت مع مرشد لأول مرة', emoji: '🤖', category: 'courage' },
  ];

  for (const achievement of achievementsList) {
    db.insert(schema.achievements).values({
      ...achievement,
      isUnlocked: false,
    } as any).run();
  }
}
