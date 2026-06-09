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
  mood_logs: any[]
  ai_conversations: any[]
  achievements: any[]
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
      return
    } catch (e) {
      console.error('Error parsing fallback database JSON, recreating:', e)
    }
  }

  // Initial Seed Data
  dataCache = {
    settings: [],
    tasks: [],
    projects: [],
    focus_sessions: [],
    habits: [],
    habit_logs: [],
    brain_dumps: [],
    dopamine_activities: getInitialDopamine(),
    mood_logs: [],
    ai_conversations: [],
    achievements: getInitialAchievements()
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

function getInitialDopamine() {
  return [
    { id: 1, name: 'مشي 5 دقائق', emoji: '🚶', description: 'تمشي شوية لتنشيط الدورة الدموية', category: 'movement', durationMinutes: 5, energyCost: 'low', dopamineScore: 7, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 2, name: 'اشرب كوب ماء', emoji: '💧', description: 'اشرب كوب ماء بارد — بسيطة وفعالة', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 4, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 3, name: 'اسمع أغنية محببة', emoji: '🎵', description: 'أغنية وحدة تحبها', category: 'sensory', durationMinutes: 5, energyCost: 'low', dopamineScore: 8, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 4, name: 'شوف فيديو مضحك', emoji: '📱', description: 'فيديو واحد بس — لا أكثر!', category: 'creative', durationMinutes: 5, energyCost: 'low', dopamineScore: 7, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 5, name: 'تنفس عميق', emoji: '🧘', description: '5 أنفاس عميقة بتهدي الجهاز العصبي', category: 'sensory', durationMinutes: 2, energyCost: 'low', dopamineScore: 5, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 6, name: 'ارسم عشوائياً', emoji: '✍️', description: 'ارسم أي حاجة عشوائية على ورقة', category: 'creative', durationMinutes: 10, energyCost: 'medium', dopamineScore: 6, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 7, name: 'انظر للطبيعة', emoji: '🌿', description: 'بص من الشباك على الأشجار أو السماء', category: 'nature', durationMinutes: 2, energyCost: 'low', dopamineScore: 5, useCount: 0, isCustom: false, createdAt: new Date().toISOString() },
    { id: 8, name: 'العب لعبة صغيرة', emoji: '🎮', description: 'لعبة بازل أو لعبة خفيفة — 10 دقائق بس', category: 'achievement', durationMinutes: 10, energyCost: 'medium', dopamineScore: 8, useCount: 0, isCustom: false, createdAt: new Date().toISOString() }
  ]
}

function getInitialAchievements() {
  return [
    { id: 1, key: 'first_focus', name: 'البداية الأولى', description: 'أكملت أول جلسة تركيز', emoji: '🌟', category: 'focus', isUnlocked: false, unlockedAt: null },
    { id: 2, key: 'focus_30', name: 'نصف ساعة ذهبية', description: '30 دقيقة تركيز متواصل', emoji: '⏱️', category: 'focus', isUnlocked: false, unlockedAt: null },
    { id: 3, key: 'focus_60', name: 'ساعة كاملة!', description: '60 دقيقة تركيز في يوم واحد', emoji: '🔥', category: 'focus', isUnlocked: false, unlockedAt: null },
    { id: 4, key: 'task_1', name: 'أول إنجاز', description: 'أكملت أول مهمة', emoji: '✅', category: 'tasks', isUnlocked: false, unlockedAt: null },
    { id: 5, key: 'task_10', name: 'عنز مهام!', description: 'أكملت 10 مهام', emoji: '🎯', category: 'tasks', isUnlocked: false, unlockedAt: null },
    { id: 6, key: 'task_50', name: 'ماكينة إنجاز', description: 'أكملت 50 مهمة', emoji: '🏆', category: 'tasks', isUnlocked: false, unlockedAt: null },
    { id: 7, key: 'streak_3', name: '3 أيام متتالية', description: '3 أيام استخدام متواصل', emoji: '🔥', category: 'consistency', isUnlocked: false, unlockedAt: null },
    { id: 8, key: 'streak_7', name: 'أسبوع كامل!', description: '7 أيام متتالية', emoji: '💎', category: 'consistency', isUnlocked: false, unlockedAt: null },
    { id: 9, key: 'streak_30', name: 'شهر من الالتزام', description: '30 يوم متتالي — أنت بطل', emoji: '👑', category: 'consistency', isUnlocked: false, unlockedAt: null },
    { id: 10, key: 'habit_first', name: 'عادة جديدة', description: 'أكملت عادة لأول مرة', emoji: '🌱', category: 'habits', isUnlocked: false, unlockedAt: null },
    { id: 11, key: 'habit_streak_7', name: 'أسبوع عادات', description: 'حافظت على عادة 7 أيام', emoji: '🌿', category: 'habits', isUnlocked: false, unlockedAt: null },
    { id: 12, key: 'brain_dump_5', name: 'تفريغ العقل', description: 'كتبت 5 brain dumps', emoji: '🧠', category: 'courage', isUnlocked: false, unlockedAt: null },
    { id: 13, key: 'graveyard_first', name: 'شجاعة الاعتراف', description: 'علّقت مشروع رسمياً — ده شجاعة مش فشل', emoji: '🎖️', category: 'courage', isUnlocked: false, unlockedAt: null },
    { id: 14, key: 'dopamine_first', name: 'مكافأة ذكية', description: 'استخدمت قائمة الدوبامين لأول مرة', emoji: '🍊', category: 'courage', isUnlocked: false, unlockedAt: null },
    { id: 15, key: 'ai_chat_first', name: 'أول محادثة', description: 'تكلمت مع مرشد لأول مرة', emoji: '🤖', category: 'courage', isUnlocked: false, unlockedAt: null }
  ]
}
