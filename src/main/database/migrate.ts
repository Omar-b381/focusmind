import { getDatabase, isFallbackDatabase } from './index';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

export function runMigrations(): void {
  if (isFallbackDatabase()) {
    console.log('Skipping SQLite migrations — running in JSON database fallback mode.');
    return;
  }
  const db = getDatabase();

  // For development v3 migration: drop tables if they exist to force clean schema alignment
  const dropTables = [
    'user_profile', 'settings', 'tasks', 'projects', 
    'learning_tracks', 'learning_lessons', 'learning_paths', 'learning_modules',
    'flashcard_decks', 'flashcards', 'fsrs_reviews', 'feynman_sessions', 'knowledge_nodes', 'learning_analytics',
    'focus_sessions', 'habits', 'habit_logs', 'brain_dumps', 'dopamine_activities',
    'dopamine_logs', 'mood_logs', 'energy_logs', 'xp_ledger', 'achievements',
    'ai_conversations', 'context_snapshots', 'learning_materials'
  ];
  for (const table of dropTables) {
    try {
      db.run(sql.raw(`DROP TABLE IF EXISTS ${table}`));
    } catch (e) {
      console.error(`Failed to drop table ${table}:`, e);
    }
  }

  // 1. user_profile
  db.run(sql`CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'المستخدم',
    avatar TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    pinch_profile TEXT DEFAULT '{}',
    peak_hour INTEGER DEFAULT 10,
    avg_daily_energy REAL DEFAULT 3,
    onboarding_done INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`);

  // 2. settings
  db.run(sql`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL,
    updated_at INTEGER
  )`);

  // 3. tasks
  db.run(sql`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    project_id INTEGER,
    track_id INTEGER,
    pinch_score REAL DEFAULT 5,
    pinch_p REAL DEFAULT 5,
    pinch_i REAL DEFAULT 5,
    pinch_n REAL DEFAULT 5,
    pinch_c REAL DEFAULT 5,
    pinch_h REAL DEFAULT 5,
    pinch_calc_at INTEGER,
    energy_level TEXT NOT NULL DEFAULT 'medium',
    estimated_minutes INTEGER DEFAULT 25,
    actual_minutes INTEGER,
    best_time TEXT DEFAULT 'any',
    status TEXT NOT NULL DEFAULT 'inbox',
    priority TEXT NOT NULL DEFAULT 'medium',
    is_micro_task INTEGER DEFAULT 0,
    parent_task_id INTEGER,
    ai_breakdown TEXT,
    micro_steps TEXT DEFAULT '[]',
    dopamine_reward_id INTEGER,
    urgency_boost TEXT,
    novelty_twist TEXT,
    challenge_frame TEXT,
    tags TEXT DEFAULT '[]',
    attachments TEXT DEFAULT '[]',
    context_notes TEXT,
    due_date INTEGER,
    scheduled_for INTEGER,
    completed_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  )`);

  // 4. projects
  db.run(sql`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '📁',
    color TEXT DEFAULT '#6366f1',
    status TEXT NOT NULL DEFAULT 'active',
    graveyard_reason TEXT,
    graveyard_lessons TEXT,
    graveyard_pct REAL DEFAULT 0,
    graveyard_celebration TEXT,
    graveyard_at INTEGER,
    total_focus_minutes INTEGER DEFAULT 0,
    task_count INTEGER DEFAULT 0,
    completed_task_count INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    target_date INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER,
    completed_at INTEGER
  )`);

  // 5. learning_paths
  db.run(sql`CREATE TABLE IF NOT EXISTS learning_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    emoji TEXT DEFAULT '📚',
    description TEXT,
    goal TEXT,
    source TEXT,
    source_url TEXT,
    ai_generated INTEGER DEFAULT 0,
    ai_roadmap TEXT,
    difficulty TEXT DEFAULT 'beginner',
    learning_style TEXT DEFAULT 'mixed',
    total_modules INTEGER DEFAULT 0,
    done_modules INTEGER DEFAULT 0,
    current_module INTEGER,
    last_position TEXT,
    daily_goal INTEGER DEFAULT 20,
    why_started TEXT,
    commitment TEXT,
    abandon_risk REAL DEFAULT 0,
    deck_id INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    total_minutes INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_studied INTEGER,
    xp_earned INTEGER DEFAULT 0,
    pinch_score REAL DEFAULT 5,
    retention REAL DEFAULT 0,
    created_at INTEGER NOT NULL,
    completed_at INTEGER
  )`);

  // 6. learning_modules
  db.run(sql`CREATE TABLE IF NOT EXISTS learning_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path_id INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'lesson',
    content TEXT,
    est_min INTEGER DEFAULT 20,
    chunks INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    auto_cards INTEGER DEFAULT 0,
    card_count INTEGER DEFAULT 0,
    notes TEXT,
    key_points TEXT,
    completed_at INTEGER
  )`);

  // 6a. flashcard_decks
  db.run(sql`CREATE TABLE IF NOT EXISTS flashcard_decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '🃏',
    description TEXT,
    path_id INTEGER,
    target_retention REAL DEFAULT 0.90,
    total_cards INTEGER DEFAULT 0,
    due_today INTEGER DEFAULT 0,
    new_today INTEGER DEFAULT 0,
    mastered INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`);

  // 6b. flashcards
  db.run(sql`CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id INTEGER NOT NULL,
    path_id INTEGER,
    module_id INTEGER,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    hint TEXT,
    tags TEXT DEFAULT '[]',
    media_type TEXT DEFAULT 'text',
    stability REAL DEFAULT 0,
    difficulty REAL DEFAULT 5,
    retrievability REAL DEFAULT 0,
    due_date INTEGER,
    last_review INTEGER,
    next_interval INTEGER DEFAULT 1,
    reviews INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,
    state TEXT DEFAULT 'new',
    ai_gen INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`);

  // 6c. fsrs_reviews
  db.run(sql`CREATE TABLE IF NOT EXISTS fsrs_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    deck_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    prev_s REAL,
    prev_d REAL,
    prev_r REAL,
    new_s REAL,
    new_d REAL,
    new_interval INTEGER,
    xp INTEGER DEFAULT 0,
    delayed INTEGER DEFAULT 0,
    reviewed_at INTEGER NOT NULL,
    response_ms INTEGER,
    date TEXT NOT NULL
  )`);

  // 6d. feynman_sessions
  db.run(sql`CREATE TABLE IF NOT EXISTS feynman_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path_id INTEGER,
    module_id INTEGER,
    concept TEXT NOT NULL,
    audience TEXT DEFAULT 'مبتدئ',
    explanation TEXT NOT NULL,
    duration_ms INTEGER,
    ai_score INTEGER,
    accuracy INTEGER,
    clarity INTEGER,
    depth INTEGER,
    analogy INTEGER,
    ai_feedback TEXT,
    ai_gaps TEXT,
    ai_next_steps TEXT,
    xp INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )`);

  // 6e. knowledge_nodes
  db.run(sql`CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path_id INTEGER,
    concept TEXT NOT NULL,
    description TEXT,
    mastery REAL DEFAULT 0,
    connections TEXT DEFAULT '[]',
    x REAL DEFAULT 0,
    y REAL DEFAULT 0,
    color TEXT DEFAULT '#6366f1',
    created_at INTEGER NOT NULL
  )`);

  // 6f. learning_analytics
  db.run(sql`CREATE TABLE IF NOT EXISTS learning_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    path_id INTEGER,
    focus_minutes INTEGER DEFAULT 0,
    cards_reviewed INTEGER DEFAULT 0,
    feynman_sessions_count INTEGER DEFAULT 0,
    avg_feynman_score REAL DEFAULT 0
  )`);

  // 7. focus_sessions
  db.run(sql`CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    project_id INTEGER,
    track_id INTEGER,
    lesson_id INTEGER,
    type TEXT NOT NULL DEFAULT 'focus',
    planned_minutes INTEGER NOT NULL,
    actual_minutes INTEGER,
    micro_rewards_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    flow_state INTEGER DEFAULT 0,
    interrupted INTEGER DEFAULT 0,
    interruption_reason TEXT,
    interruption_count INTEGER DEFAULT 0,
    interruption_reasons TEXT DEFAULT '[]',
    mood_before INTEGER,
    mood_after INTEGER,
    energy_before INTEGER,
    energy_after INTEGER,
    pinch_active TEXT,
    notes TEXT,
    context_saved TEXT,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    date TEXT NOT NULL
  )`);

  // 8. habits
  db.run(sql`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '✅',
    description TEXT,
    type TEXT NOT NULL DEFAULT 'build',
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_days TEXT DEFAULT '[1,2,3,4,5,6,0]',
    reminder_time TEXT,
    energy_required TEXT DEFAULT 'low',
    duration_min INTEGER DEFAULT 5,
    dopamine_boost INTEGER DEFAULT 5,
    xp INTEGER DEFAULT 10,
    linked_dopamine INTEGER,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  )`);

  // 9. habit_logs
  db.run(sql`CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL,
    quality INTEGER DEFAULT 3,
    notes TEXT,
    duration_min INTEGER,
    completed_at INTEGER
  )`);

  // 10. brain_dumps
  db.run(sql`CREATE TABLE IF NOT EXISTS brain_dumps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'uncategorized',
    ai_done INTEGER DEFAULT 0,
    ai_suggestion TEXT,
    converted_to_task_id INTEGER,
    track_id INTEGER,
    is_archived INTEGER DEFAULT 0,
    urgency TEXT DEFAULT 'low',
    created_at INTEGER NOT NULL
  )`);

  // 11. dopamine_activities
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
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  )`);

  // 12. dopamine_logs
  db.run(sql`CREATE TABLE IF NOT EXISTS dopamine_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    used_at INTEGER NOT NULL,
    mood_before INTEGER,
    mood_after INTEGER,
    notes TEXT,
    date TEXT NOT NULL
  )`);

  // 13. mood_logs
  db.run(sql`CREATE TABLE IF NOT EXISTS mood_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    mood INTEGER NOT NULL,
    energy INTEGER NOT NULL,
    focus INTEGER NOT NULL,
    anxiety INTEGER DEFAULT 3,
    emoji TEXT,
    notes TEXT,
    tags TEXT DEFAULT '[]',
    rsd INTEGER DEFAULT 0,
    triggered_by TEXT,
    created_at INTEGER NOT NULL
  )`);

  // 14. energy_logs
  db.run(sql`CREATE TABLE IF NOT EXISTS energy_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    hour INTEGER NOT NULL,
    energy INTEGER NOT NULL
  )`);

  // 15. xp_ledger
  db.run(sql`CREATE TABLE IF NOT EXISTS xp_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ref_id INTEGER,
    ref_type TEXT,
    total_after INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);

  // 16. achievements
  db.run(sql`CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    emoji TEXT NOT NULL,
    category TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    rarity TEXT DEFAULT 'common',
    condition TEXT NOT NULL DEFAULT '{}',
    unlocked_at INTEGER,
    is_unlocked INTEGER DEFAULT 0,
    is_hidden INTEGER DEFAULT 0
  )`);

  // 17. ai_conversations
  db.run(sql`CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    context TEXT NOT NULL DEFAULT 'coach',
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    messages TEXT NOT NULL,
    summary TEXT,
    key_insights TEXT,
    date TEXT NOT NULL,
    duration_sec INTEGER,
    tokens INTEGER,
    created_at INTEGER NOT NULL
  )`);

  // 18. context_snapshots
  db.run(sql`CREATE TABLE IF NOT EXISTS context_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    project_id INTEGER,
    track_id INTEGER,
    snapshot TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);

  // 19. learning_materials
  db.run(sql`CREATE TABLE IF NOT EXISTS learning_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    file_path TEXT,
    file_size INTEGER,
    file_type TEXT,
    track_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    summary TEXT,
    concept_map TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  )`);


  // Seed default data
  seedUserProfile();
  seedDopamineActivities();
  seedAchievements();
}

function seedUserProfile(): void {
  const db = getDatabase();
  const count = db.select({ count: sql<number>`count(*)` }).from(schema.userProfile).get();
  if (count && count.count > 0) return;

  const now = new Date();
  db.insert(schema.userProfile).values({
    id: 1,
    name: 'عمر',
    avatar: '🧠',
    level: 1,
    totalXP: 0,
    currentStreakDays: 0,
    longestStreakDays: 0,
    pinchProfile: JSON.stringify({ p: 8, i: 7, n: 6, c: 5, h: 9 }),
    peakHour: 10,
    avgDailyEnergy: 3.0,
    onboardingCompleted: false,
    createdAt: now,
  } as any).run();
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
    { name: 'العب لعبة صغيرة', emoji: '🎮', description: 'لعبة بازل أو لعبة خفيفة — 10 دقائق بس', category: 'play', durationMinutes: 10, energyCost: 'medium', dopamineScore: 8 },
    { name: 'اغسل وجهك بماء بارد', emoji: '🛁', description: 'صدمة حرارية خفيفة لتنبيه الأعصاب', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 6 },
    { name: 'تمارين تمدد خفيفة', emoji: '🤸', description: 'تمديد العضلات لتخفيف التوتر', category: 'movement', durationMinutes: 5, energyCost: 'medium', dopamineScore: 7 },
    { name: 'اقرأ اقتباساً ملهماً', emoji: '🌟', description: 'جرعة تحفيز سريعة', category: 'achievement', durationMinutes: 2, energyCost: 'low', dopamineScore: 5 },
    { name: 'رتب مكتبك لـ 3 دقائق', emoji: '🧹', description: 'تنظيف مساحة العمل يعيد تنظيم ذهنك', category: 'achievement', durationMinutes: 3, energyCost: 'medium', dopamineScore: 6 }
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
    { key: 'first_breath', name: 'أول تركيز', nameAr: 'أول تركيز', descriptionAr: 'أكملت أول جلسة تركيز كاملة', emoji: '✨', category: 'focus', xpReward: 25, rarity: 'common' },
    { key: 'first_focus', name: 'البداية الأولى', nameAr: 'البداية الأولى', descriptionAr: 'بدأت أول جلسة تركيز', emoji: '🌟', category: 'focus', xpReward: 25, rarity: 'common' },
    { key: 'focus_30', name: 'نصف ساعة ذهبية', nameAr: 'نصف ساعة ذهبية', descriptionAr: '30 دقيقة تركيز متواصل', emoji: '⏱️', category: 'focus', xpReward: 50, rarity: 'common' },
    { key: 'focus_60', name: 'ساعة كاملة!', nameAr: 'ساعة كاملة!', descriptionAr: '60 دقيقة تركيز في يوم واحد', emoji: '🔥', category: 'focus', xpReward: 100, rarity: 'rare' },
    { key: 'task_1', name: 'أول إنجاز', nameAr: 'أول إنجاز', descriptionAr: 'أكملت أول مهمة', emoji: '✅', category: 'tasks', xpReward: 15, rarity: 'common' },
    { key: 'task_10', name: 'عشر مهام!', nameAr: 'عشر مهام!', descriptionAr: 'أكملت 10 مهام', emoji: '🎯', category: 'tasks', xpReward: 50, rarity: 'common' },
    { key: 'task_50', name: 'ماكينة إنجاز', nameAr: 'ماكينة إنجاز', descriptionAr: 'أكملت 50 مهمة', emoji: '🏆', category: 'tasks', xpReward: 200, rarity: 'epic' },
    { key: 'streak_3', name: '3 أيام متتالية', nameAr: '3 أيام متتالية', descriptionAr: '3 أيام استخدام متواصل', emoji: '🔥', category: 'consistency', xpReward: 30, rarity: 'common' },
    { key: 'streak_7', name: 'أسبوع كامل!', nameAr: 'أسبوع كامل!', descriptionAr: '7 أيام متتالية', emoji: '💎', category: 'consistency', xpReward: 100, rarity: 'rare' },
    { key: 'streak_30', name: 'شهر من الالتزام', nameAr: 'شهر من الالتزام', descriptionAr: '30 يوم متتالي — أنت بطل', emoji: '👑', category: 'consistency', xpReward: 300, rarity: 'legendary' },
    { key: 'habit_first', name: 'عادة جديدة', nameAr: 'عادة جديدة', descriptionAr: 'أكملت عادة لأول مرة', emoji: '🌱', category: 'habits', xpReward: 20, rarity: 'common' },
    { key: 'habit_streak_7', name: 'أسبوع عادات', nameAr: 'أسبوع عادات', descriptionAr: 'حافظت على عادة 7 أيام', emoji: '🌿', category: 'habits', xpReward: 75, rarity: 'rare' },
    { key: 'brain_dump_5', name: 'تفريغ العقل', nameAr: 'تفريغ العقل', descriptionAr: 'كتبت 5 brain dumps', emoji: '🧠', category: 'courage', xpReward: 50, rarity: 'common' },
    { key: 'dump_master', name: 'أستاذ التفريغ', nameAr: 'أستاذ التفريغ', descriptionAr: 'كتبت 50 brain dumps', emoji: '🔮', category: 'courage', xpReward: 150, rarity: 'rare' },
    { key: 'graveyard_honest', name: 'شجاعة الاعتراف', nameAr: 'شجاعة الاعتراف', descriptionAr: 'علّقت مشروعاً رسمياً — ده شجاعة مش فشل', emoji: '🪦', category: 'courage', xpReward: 75, rarity: 'rare' },
    { key: 'dopamine_first', name: 'مكافأة ذكية', nameAr: 'مكافأة ذكية', descriptionAr: 'استخدمت قائمة الدوبامين لأول مرة', emoji: '🍊', category: 'courage', xpReward: 20, rarity: 'common' },
    { key: 'ai_chat_first', name: 'أول محادثة', nameAr: 'أول محادثة', descriptionAr: 'تكلمت مع مرشد لأول مرة', emoji: '🤖', category: 'courage', xpReward: 20, rarity: 'common' },
    { key: 'micro_warrior', name: 'محارب الميكرو', nameAr: 'محارب الميكرو', descriptionAr: 'أول مهمة تفكيك micro', emoji: '⚔️', category: 'tasks', xpReward: 20, rarity: 'common' },
    { key: 'flow_rider', name: 'راكب التدفق', nameAr: 'راكب التدفق', descriptionAr: 'دخلت حالة التدفق (Flow State) 5 مرات', emoji: '🌊', category: 'consistency', xpReward: 150, rarity: 'epic' },
    { key: 'track_finisher', name: 'خريج المسارات', nameAr: 'خريج المسارات', descriptionAr: 'أكملت مسار تعلم كامل بنجاح', emoji: '🎓', category: 'learning', xpReward: 500, rarity: 'legendary' },
    { key: 'pinch_master', name: 'بطل الدوبامين', nameAr: 'بطل الدوبامين', descriptionAr: 'أكملت 10 مهام ذات تقييم PINCH عالٍ', emoji: '⚡', category: 'consistency', xpReward: 200, rarity: 'epic' },
    { key: 'rsd_survivor', name: 'شجاعة المحاولة', nameAr: 'شجاعة المحاولة', descriptionAr: 'تجاوزت انتكاسة وعدت للتركيز من جديد', emoji: '💙', category: 'courage', xpReward: 100, rarity: 'special' }
  ];

  for (const achievement of achievementsList) {
    db.insert(schema.achievements).values({
      ...achievement,
      isUnlocked: false,
      isHidden: false,
    } as any).run();
  }
}
