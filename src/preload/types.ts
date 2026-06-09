export interface Task {
  id: number
  title: string
  description: string | null
  projectId: number | null
  learningTrackId: number | null
  
  // PINCH System
  pinchScore: number
  pinchPassion: number
  pinchInterest: number
  pinchNovelty: number
  pinchChallenge: number
  pinchHurry: number
  pinchLastCalc: Date | null

  // Energy & Scheduling
  energyLevel: 'low' | 'medium' | 'high' | 'peak'
  estimatedMinutes: number
  actualMinutes: number | null
  bestTimeOfDay: string

  // Status & Priority
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'inbox' | 'today' | 'scheduled' | 'in_progress' | 'done' | 'parked' | 'delegated'

  // ADHD-specific
  isMicroTask: boolean
  parentTaskId: number | null
  aiBreakdown: string | null // JSON string of steps
  microSteps: string // JSON string of subtask list
  
  dopamineRewardId: number | null
  urgencyBoost: string | null
  noveltyTwist: string | null
  challengeFrame: string | null

  // Context
  tags: string // JSON string of tags
  attachments: string // JSON string
  contextNotes: string | null

  dueDate: Date | null
  scheduledFor: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

export interface Project {
  id: number
  name: string
  description: string | null
  emoji: string
  color: string
  status: 'active' | 'paused' | 'completed' | 'graveyard'
  
  graveyardReason: string | null
  graveyardLessons: string | null
  graveyardCompletionPct: number
  graveyardCelebration: string | null
  graveyardedAt: Date | null

  totalFocusMinutes: number
  taskCount: number
  completedTaskCount: number
  xpEarned: number
  targetDate: Date | null
  createdAt: Date
  updatedAt: Date | null
  completedAt: Date | null
}

export interface LearningTrack {
  id: number
  title: string
  emoji: string
  description: string | null
  source: string | null
  sourceUrl: string | null

  totalLessons: number
  completedLessons: number
  currentLesson: number
  currentLessonTitle: string | null
  lastPosition: string | null

  dailyGoalMinutes: number
  whyStarted: string | null
  commitment: string | null
  status: 'active' | 'paused' | 'completed' | 'parked'

  currentStreakDays: number
  longestStreakDays: number
  lastStudiedAt: Date | null

  totalStudyMinutes: number
  xpEarned: number
  pinchScore: number

  createdAt: Date
  completedAt: Date | null
}

export interface LearningLesson {
  id: number
  trackId: number
  order: number
  title: string
  estimatedMinutes: number
  actualMinutes: number | null
  status: 'pending' | 'in_progress' | 'done' | 'skipped'
  notes: string | null
  keyPoints: string | null // JSON string
  completedAt: Date | null
}

export interface FocusSession {
  id: number
  taskId: number | null
  projectId: number | null
  learningTrackId: number | null
  lessonId: number | null
  type: 'focus' | 'short_break' | 'long_break' | 'free_flow'
  
  plannedMinutes: number
  actualMinutes: number | null
  microRewardsEarned: number // maps to microStarsEarned
  xpEarned: number

  flowState: boolean
  interrupted: boolean
  interruptionReason: string | null
  interruptionCount: number
  interruptionReasons: string // JSON string

  moodBefore: number | null
  moodAfter: number | null
  energyBefore: number | null
  energyAfter: number | null

  pinchActive: string | null
  notes: string | null
  contextSaved: string | null
  
  startedAt: Date
  endedAt: Date | null
  date: string // YYYY-MM-DD
}

export interface Habit {
  id: number
  name: string
  emoji: string
  description: string | null
  type: 'build' | 'break'
  frequency: string
  targetDays: string // JSON representation
  reminderTime: string | null
  energyRequired: 'low' | 'medium' | 'high'
  durationMinutes: number
  dopamineBoost: number
  xpPerCompletion: number
  linkedDopamineId: number | null

  currentStreak: number
  longestStreak: number
  totalCompletions: number
  isActive: boolean
  createdAt: Date
}

export interface HabitLog {
  id: number
  habitId: number
  date: string // YYYY-MM-DD
  completed: boolean
  quality: number
  notes: string | null
  durationMinutes: number | null
  completedAt: Date | null
}

export interface BrainDump {
  id: number
  content: string
  category: string
  aiCategorized: boolean
  aiSuggestion: string | null
  convertedToTaskId: number | null
  convertedToTrackId: number | null
  isArchived: boolean
  urgencyLevel: 'low' | 'medium' | 'high'
  createdAt: Date
}

export interface DopamineActivity {
  id: number
  name: string
  emoji: string
  description: string | null
  category: 'movement' | 'creative' | 'social' | 'sensory' | 'achievement' | 'nature' | 'play'
  durationMinutes: number
  energyCost: 'low' | 'medium' | 'high'
  dopamineScore: number
  useCount: number
  lastUsedAt: Date | null
  isCustom: boolean
  isActive: boolean
  createdAt: Date
}

export interface DopamineLog {
  id: number
  activityId: number
  usedAt: Date
  moodBefore: number | null
  moodAfter: number | null
  notes: string | null
  date: string
}

export interface MoodLog {
  id: number
  date: string
  time: string
  mood: number
  energy: number
  focus: number
  anxiety: number
  emoji: string | null
  notes: string | null
  tags: string // JSON representation
  rsdTriggered: boolean
  triggeredBy: string | null
  createdAt: Date
}

export interface EnergyLog {
  id: number
  date: string
  hour: number
  energyLevel: number
}

export interface XPLedgerEntry {
  id: number
  amount: number
  reason: string
  referenceId: number | null
  referenceType: string | null
  totalAfter: number
  date: string
  createdAt: Date
}

export interface Achievement {
  id: number
  key: string
  name: string
  nameAr: string
  descriptionAr: string
  emoji: string
  category: 'focus' | 'tasks' | 'habits' | 'learning' | 'consistency' | 'courage' | 'special'
  xpReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  condition: string // JSON representation
  unlockedAt: Date | null
  isUnlocked: boolean
  isHidden: boolean
}

export interface UserProfile {
  id: number
  name: string
  avatar: string | null
  level: number
  totalXP: number
  currentStreakDays: number
  longestStreakDays: number
  pinchProfile: string // JSON representation
  peakHour: number
  avgDailyEnergy: number
  onboardingCompleted: boolean
  createdAt: Date
}

export interface ContextSnapshot {
  id: number
  taskId: number | null
  projectId: number | null
  learningTrackId: number | null
  snapshot: string // JSON representation
  createdAt: Date
}

export interface AppSettings {
  [key: string]: string
}

export interface LearningMaterial {
  id: number
  title: string
  content: string | null
  filePath: string | null
  fileSize: number | null
  fileType: string | null // 'pdf', 'txt', 'markdown', 'link', 'text_input'
  learningTrackId: number | null
  status: 'pending' | 'reading' | 'summarized' | 'read'
  summary: string | null // markdown summary
  conceptMap: string | null // JSON string of 3D nodes/links
  createdAt: Date
  updatedAt: Date | null
}

