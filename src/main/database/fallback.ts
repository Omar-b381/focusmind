import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

interface FallbackData {
  settings: any[]
  tasks: any[]
  projects: any[]
  focus_sessions: any[]
  habits: any[]
  habit_logs: any[]
  brain_dumps: any[]
  dopamine_activities: any[]
  dopamine_logs: any[]
  mood_logs: any[]
  energy_logs: any[]
  xp_ledger: any[]
  achievements: any[]
  ai_conversations: any[]
  context_snapshots: any[]
  user_profile: any[]
  learning_tracks: any[]
  learning_lessons: any[]
}

let dataFilePath: string
let dataCache: FallbackData | null = null

function getFilePath(): string {
  if (dataFilePath) return dataFilePath
  const userDataPath = app.getPath('userData')
  dataFilePath = join(userDataPath, 'focusmind_data.json')
  return dataFilePath
}

export function initFallbackDatabase(): void {
  const filePath = getFilePath()
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      dataCache = JSON.parse(content)
      // Double check if v2 keys exist, if not reset/extend
      if (dataCache && !dataCache.user_profile) {
        dataCache.user_profile = getInitialProfile()
        dataCache.learning_tracks = []
        dataCache.learning_lessons = []
        dataCache.dopamine_logs = []
        dataCache.energy_logs = []
        dataCache.xp_ledger = []
        dataCache.context_snapshots = []
        dataCache.achievements = getInitialAchievements()
        dataCache.dopamine_activities = getInitialDopamine()
        saveData()
      }
      return
    } catch (e) {
      console.error('Error parsing fallback database JSON, recreating:', e)
    }
  }

  // Initial Seed Data for v2
  dataCache = {
    settings: [],
    tasks: [],
    projects: [],
    focus_sessions: [],
    habits: [],
    habit_logs: [],
    brain_dumps: [],
    dopamine_activities: getInitialDopamine(),
    dopamine_logs: [],
    mood_logs: [],
    energy_logs: [],
    xp_ledger: [],
    achievements: getInitialAchievements(),
    ai_conversations: [],
    context_snapshots: [],
    user_profile: getInitialProfile(),
    learning_tracks: [],
    learning_lessons: []
  }
  saveData()
}

function saveData(): void {
  if (!dataCache) return
  try {
    writeFileSync(getFilePath(), JSON.stringify(dataCache, null, 2), 'utf-8')
  } catch (e) {
    console.error('Error saving fallback database JSON:', e)
  }
}

export function getFallbackCollection<K extends keyof FallbackData>(collection: K): FallbackData[K] {
  if (!dataCache) initFallbackDatabase()
  return dataCache![collection] || []
}

export function insertFallback<K extends keyof FallbackData>(collection: K, item: any): any {
  if (!dataCache) initFallbackDatabase()
  const list = dataCache![collection]
  
  // Auto-increment ID if needed
  if (!item.id) {
    const maxId = list.reduce((max: number, current: any) => (current.id > max ? current.id : max), 0)
    item.id = maxId + 1
  }
  
  item.createdAt = item.createdAt || new Date().toISOString()
  list.push(item)
  saveData()
  return item
}

export function updateFallback<K extends keyof FallbackData>(collection: K, id: number, updates: any): any {
  if (!dataCache) initFallbackDatabase()
  const list = dataCache![collection]
  const idx = list.findIndex((item: any) => item.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() }
    saveData()
    return list[idx]
  }
  return null
}

export function deleteFallback<K extends keyof FallbackData>(collection: K, id: number): boolean {
  if (!dataCache) initFallbackDatabase()
  const list = dataCache![collection]
  const initialLength = list.length
  dataCache![collection] = list.filter((item: any) => item.id !== id) as any
  saveData()
  return dataCache![collection].length < initialLength
}

function getInitialProfile() {
  return [
    {
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
      createdAt: new Date().toISOString()
    }
  ]
}

function getInitialDopamine() {
  return [
    { id: 1, name: 'مشي 5 دقائق', emoji: '🚶', description: 'تمشي شوية لتنشيط الدورة الدموية', category: 'movement', durationMinutes: 5, energyCost: 'low', dopamineScore: 7, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 2, name: 'اشرب كوب ماء', emoji: '💧', description: 'اشرب كوب ماء بارد — بسيطة وفعالة', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 4, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 3, name: 'اسمع أغنية محببة', emoji: '🎵', description: 'أغنية وحدة تحبها', category: 'sensory', durationMinutes: 5, energyCost: 'low', dopamineScore: 8, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 4, name: 'شوف فيديو مضحك', emoji: '📱', description: 'فيديو واحد بس — لا أكثر!', category: 'creative', durationMinutes: 5, energyCost: 'low', dopamineScore: 7, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 5, name: 'تنفس عميق', emoji: '🧘', description: '5 أنفاس عميقة بتهدي الجهاز العصبي', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 5, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 6, name: 'ارسم عشوائياً', emoji: '✍️', description: 'ارسم أي حاجة عشوائية على ورقة', category: 'creative', durationMinutes: 10, energyCost: 'medium', dopamineScore: 6, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 7, name: 'انظر للطبيعة', emoji: '🌿', description: 'بص من الشباك على الأشجار أو السماء', category: 'nature', durationMinutes: 2, energyCost: 'low', dopamineScore: 5, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 8, name: 'العب لعبة صغيرة', emoji: '🎮', description: 'لعبة بازل أو لعبة خفيفة — 10 دقائق بس', category: 'play', durationMinutes: 10, energyCost: 'medium', dopamineScore: 8, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 9, name: 'اغسل وجهك بماء بارد', emoji: '🛁', description: 'صدمة حرارية خفيفة لتنبيه الأعصاب', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 6, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 10, name: 'تمارين تمدد خفيفة', emoji: '🤸', description: 'تمديد العضلات لتخفيف التوتر', category: 'movement', durationMinutes: 5, energyCost: 'medium', dopamineScore: 7, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 11, name: 'اقرأ اقتباساً ملهماً', emoji: '🌟', description: 'جرعة تحفيز سريعة', category: 'achievement', durationMinutes: 2, energyCost: 'low', dopamineScore: 5, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 12, name: 'رتب مكتبك لـ 3 دقائق', emoji: '🧹', description: 'تنظيف مساحة العمل يعيد تنظيم ذهنك', category: 'achievement', durationMinutes: 3, energyCost: 'medium', dopamineScore: 6, useCount: 0, isCustom: false, createdAt: new Date().toISOString() }
  ]
}

function getInitialAchievements() {
  return [
    { id: 1, key: 'first_breath', name: 'أول تركيز', nameAr: 'أول تركيز', descriptionAr: 'أكملت أول جلسة تركيز كاملة', emoji: '✨', category: 'focus', xpReward: 25, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 2, key: 'first_focus', name: 'البداية الأولى', nameAr: 'البداية الأولى', descriptionAr: 'بدأت أول جلسة تركيز', emoji: '🌟', category: 'focus', xpReward: 25, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 3, key: 'focus_30', name: 'نصف ساعة ذهبية', nameAr: 'نصف ساعة ذهبية', descriptionAr: '30 دقيقة تركيز متواصل', emoji: '⏱️', category: 'focus', xpReward: 50, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 4, key: 'focus_60', name: 'ساعة كاملة!', nameAr: 'ساعة كاملة!', descriptionAr: '60 دقيقة تركيز في يوم واحد', emoji: '🔥', category: 'focus', xpReward: 100, rarity: 'rare', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 5, key: 'task_1', name: 'أول إنجاز', nameAr: 'أول إنجاز', descriptionAr: 'أكملت أول مهمة', emoji: '✅', category: 'tasks', xpReward: 15, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 6, key: 'task_10', name: 'عشر مهام!', nameAr: 'عشر مهام!', descriptionAr: 'أكملت 10 مهام', emoji: '🎯', category: 'tasks', xpReward: 50, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 7, key: 'task_50', name: 'ماكينة إنجاز', nameAr: 'ماكينة إنجاز', descriptionAr: 'أكملت 50 مهمة', emoji: '🏆', category: 'tasks', xpReward: 200, rarity: 'epic', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 8, key: 'streak_3', name: '3 أيام متتالية', nameAr: '3 أيام متتالية', descriptionAr: '3 أيام استخدام متواصل', emoji: '🔥', category: 'consistency', xpReward: 30, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 9, key: 'streak_7', name: 'أسبوع كامل!', nameAr: 'أسبوع كامل!', descriptionAr: '7 أيام متتالية', emoji: '💎', category: 'consistency', xpReward: 100, rarity: 'rare', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 10, key: 'streak_30', name: 'شهر من الالتزام', nameAr: 'شهر من الالتزام', descriptionAr: '30 يوم متتالي — أنت بطل', emoji: '👑', category: 'consistency', xpReward: 300, rarity: 'legendary', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 11, key: 'habit_first', name: 'عادة جديدة', nameAr: 'عادة جديدة', descriptionAr: 'أكملت عادة لأول مرة', emoji: '🌱', category: 'habits', xpReward: 20, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 12, key: 'habit_streak_7', name: 'أسبوع عادات', nameAr: 'أسبوع عادات', descriptionAr: 'حافظت على عادة 7 أيام', emoji: '🌿', category: 'habits', xpReward: 75, rarity: 'rare', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 13, key: 'brain_dump_5', name: 'تفريغ العقل', nameAr: 'تفريغ العقل', descriptionAr: 'كتبت 5 brain dumps', emoji: '🧠', category: 'courage', xpReward: 50, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 14, key: 'dump_master', name: 'أستاذ التفريغ', nameAr: 'أستاذ التفريغ', descriptionAr: 'كتبت 50 brain dumps', emoji: '🔮', category: 'courage', xpReward: 150, rarity: 'rare', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 15, key: 'graveyard_honest', name: 'شجاعة الاعتراف', nameAr: 'شجاعة الاعتراف', descriptionAr: 'علّقت مشروعاً رسمياً — ده شجاعة مش فشل', emoji: '🪦', category: 'courage', xpReward: 75, rarity: 'rare', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 16, key: 'dopamine_first', name: 'مكافأة ذكية', nameAr: 'مكافأة ذكية', descriptionAr: 'استخدمت قائمة الدوبامين لأول مرة', emoji: '🍊', category: 'courage', xpReward: 20, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 17, key: 'ai_chat_first', name: 'أول محادثة', nameAr: 'أول محادثة', descriptionAr: 'تكلمت مع مرشد لأول مرة', emoji: '🤖', category: 'courage', xpReward: 20, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 18, key: 'micro_warrior', name: 'محارب الميكرو', nameAr: 'محارب الميكرو', descriptionAr: 'أول مهمة تفكيك micro', emoji: '⚔️', category: 'tasks', xpReward: 20, rarity: 'common', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 19, key: 'flow_rider', name: 'راكب التدفق', nameAr: 'راكب التدفق', descriptionAr: 'دخلت حالة التدفق (Flow State) 5 مرات', emoji: '🌊', category: 'consistency', xpReward: 150, rarity: 'epic', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 20, key: 'track_finisher', name: 'خريج المسارات', nameAr: 'خريج المسارات', descriptionAr: 'أكملت مسار تعلم كامل بنجاح', emoji: '🎓', category: 'learning', xpReward: 500, rarity: 'legendary', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 21, key: 'pinch_master', name: 'بطل الدوبامين', nameAr: 'بطل الدوبامين', descriptionAr: 'أكملت 10 مهام ذات تقييم PINCH عالٍ', emoji: '⚡', category: 'consistency', xpReward: 200, rarity: 'epic', isUnlocked: false, unlockedAt: null, isHidden: false },
    { id: 22, key: 'rsd_survivor', name: 'شجاعة المحاولة', nameAr: 'شجاعة المحاولة', descriptionAr: 'تجاوزت انتكاسة وعدت للتركيز من جديد', emoji: '💙', category: 'courage', xpReward: 100, rarity: 'special', isUnlocked: false, unlockedAt: null, isHidden: false }
  ]
}
