// ==========================================
// FocusMind — App Constants
// ==========================================

// Energy levels for tasks
export const ENERGY_LEVELS = [
  { value: 'low', label: 'طاقة منخفضة', emoji: '🔋', color: 'text-slate-400' },
  { value: 'medium', label: 'طاقة متوسطة', emoji: '⚡', color: 'text-blue-400' },
  { value: 'high', label: 'طاقة عالية', emoji: '🔥', color: 'text-orange-400' },
] as const

// Task priorities
export const PRIORITIES = [
  { value: 'urgent', label: 'عاجل', emoji: '🚨', color: 'text-red-400' },
  { value: 'high', label: 'مرتفع', emoji: '🔴', color: 'text-orange-400' },
  { value: 'medium', label: 'متوسط', emoji: '🟡', color: 'text-yellow-400' },
  { value: 'low', label: 'منخفض', emoji: '🟢', color: 'text-green-400' },
] as const

// Task statuses
export const TASK_STATUSES = [
  { value: 'inbox', label: 'صندوق الوارد', emoji: '📥' },
  { value: 'today', label: 'اليوم', emoji: '📅' },
  { value: 'in_progress', label: 'قيد التنفيذ', emoji: '🔄' },
  { value: 'done', label: 'مكتمل', emoji: '✅' },
  { value: 'parked', label: 'معلّق', emoji: '⏸️' },
] as const

// Project statuses
export const PROJECT_STATUSES = [
  { value: 'active', label: 'نشط', emoji: '🟢' },
  { value: 'paused', label: 'متوقف', emoji: '⏸️' },
  { value: 'completed', label: 'مكتمل', emoji: '🎉' },
  { value: 'graveyard', label: 'مقبرة المشاريع', emoji: '🪦' },
] as const

// Mood emojis (1-5 scale)
export const MOOD_EMOJIS = ['😣', '😔', '😐', '🙂', '😄'] as const
export const ENERGY_EMOJIS = ['🪫', '🔋', '⚡', '💪', '🔥'] as const
export const FOCUS_EMOJIS = ['🌫️', '🌥️', '⛅', '🌤️', '☀️'] as const

// Brain dump categories
export const DUMP_CATEGORIES = [
  { value: 'task', label: 'مهمة', emoji: '✅' },
  { value: 'idea', label: 'فكرة', emoji: '💡' },
  { value: 'worry', label: 'قلق', emoji: '😰' },
  { value: 'reminder', label: 'تذكير', emoji: '🔔' },
  { value: 'random', label: 'عشوائي', emoji: '🎲' },
  { value: 'uncategorized', label: 'غير مصنف', emoji: '📝' },
] as const

// Dopamine activity categories
export const DOPAMINE_CATEGORIES = [
  { value: 'movement', label: 'حركة', emoji: '🏃' },
  { value: 'creative', label: 'إبداع', emoji: '🎨' },
  { value: 'social', label: 'اجتماعي', emoji: '👥' },
  { value: 'sensory', label: 'حسّي', emoji: '🎵' },
  { value: 'achievement', label: 'إنجاز', emoji: '🏆' },
  { value: 'nature', label: 'طبيعة', emoji: '🌿' },
] as const

// Habit types
export const HABIT_TYPES = [
  { value: 'build', label: 'بناء عادة إيجابية', emoji: '🌱' },
  { value: 'break', label: 'كسر عادة سلبية', emoji: '🚫' },
] as const

// Focus timer defaults
export const FOCUS_DEFAULTS = {
  workMinutes: 25,
  shortBreak: 5,
  longBreak: 20,
  microRewardInterval: 5, // minutes
  sessionsBeforeLongBreak: 4,
}

// Micro reward messages (Arabic)
export const MICRO_REWARD_MESSAGES = [
  'ممتاز ⭐',
  'استمر 💪',
  'أنت تتقدم 🚀',
  'رائع جداً ✨',
  'إنجاز حقيقي 🌟',
  'أنت بطل 🏆',
  'واصل 🔥',
  'ماشاء الله 💎',
  'يا سلام عليك 👏',
  'كمّل كده 💫',
]

// Sidebar navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'الرئيسية', icon: 'LayoutDashboard' },
  { path: '/focus', label: 'وضع التركيز', icon: 'Timer' },
  { path: '/tasks', label: 'المهام', icon: 'CheckSquare' },
  { path: '/projects', label: 'المشاريع', icon: 'FolderKanban' },
  { path: '/ai-coach', label: 'المدرب الذكي', icon: 'Bot' },
  { path: '/dopamine', label: 'قائمة الدوبامين', icon: 'Sparkles' },
  { path: '/habits', label: 'العادات', icon: 'Flame' },
  { path: '/brain-dump', label: 'تفريغ العقل', icon: 'Brain' },
  { path: '/analytics', label: 'التحليلات', icon: 'BarChart3' },
  { path: '/settings', label: 'الإعدادات', icon: 'Settings' },
] as const

// Achievement categories
export const ACHIEVEMENT_CATEGORIES = [
  { value: 'focus', label: 'تركيز', emoji: '🎯' },
  { value: 'tasks', label: 'مهام', emoji: '✅' },
  { value: 'habits', label: 'عادات', emoji: '🌱' },
  { value: 'consistency', label: 'استمرارية', emoji: '🔥' },
  { value: 'courage', label: 'شجاعة', emoji: '🦁' },
] as const

// AI Providers configuration
export const AI_PROVIDERS = [
  {
    id: 'anthropic' as const,
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet — الأفضل للفهم والمحادثة',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    requiresKey: true,
    docsUrl: 'https://console.anthropic.com',
  },
  {
    id: 'openai' as const,
    name: 'OpenAI GPT',
    description: 'GPT-4o — قوي وسريع',
    models: ['gpt-4o', 'gpt-4o-mini'],
    requiresKey: true,
    docsUrl: 'https://platform.openai.com',
  },
  {
    id: 'gemini' as const,
    name: 'Google Gemini',
    description: 'Gemini 1.5 Flash — مجاني ومناسب',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    requiresKey: true,
    docsUrl: 'https://aistudio.google.com',
  },
  {
    id: 'ollama' as const,
    name: 'Ollama (محلي)',
    description: 'شغّل موديل محلي — خصوصية تامة بدون انترنت',
    models: ['llama3.2', 'mistral', 'phi3', 'gemma2'],
    requiresKey: false,
    requiresUrl: true,
    defaultUrl: 'http://localhost:11434',
  },
  {
    id: 'openrouter' as const,
    name: 'OpenRouter',
    description: 'وصول لمئات الموديلات بـ API واحد',
    models: ['auto'],
    requiresKey: true,
    docsUrl: 'https://openrouter.ai',
  },
  {
    id: 'custom' as const,
    name: 'Custom Endpoint',
    description: 'أي endpoint متوافق مع OpenAI API',
    models: [],
    requiresKey: false,
    requiresUrl: true,
  },
] as const
