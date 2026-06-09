export interface Task {
  id: number
  title: string
  description: string | null
  projectId: number | null
  energyLevel: 'low' | 'medium' | 'high'
  estimatedMinutes: number
  actualMinutes: number | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'inbox' | 'today' | 'in_progress' | 'done' | 'parked'
  isMicroTask: boolean
  parentTaskId: number | null
  dopamineRewardId: number | null
  aiBreakdown: string | null // JSON string of steps
  tags: string // JSON string of tags
  dueDate: Date | null
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
  totalFocusMinutes: number
  taskCount: number
  completedTaskCount: number
  targetDate: Date | null
  createdAt: Date
  updatedAt: Date | null
  completedAt: Date | null
}

export interface FocusSession {
  id: number
  taskId: number | null
  projectId: number | null
  type: 'focus' | 'short_break' | 'long_break' | 'free'
  plannedMinutes: number
  actualMinutes: number | null
  interrupted: boolean
  interruptionReason: string | null
  moodBefore: number | null
  moodAfter: number | null
  energyBefore: number | null
  notes: string | null
  microRewardsEarned: number
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
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  energyRequired: 'low' | 'medium' | 'high'
  dopamineBoost: number
  isActive: boolean
  createdAt: Date
}

export interface HabitLog {
  id: number
  habitId: number
  date: string // YYYY-MM-DD
  completed: boolean
  notes: string | null
  completedAt: Date | null
}

export interface BrainDump {
  id: number
  content: string
  category: string
  convertedToTaskId: number | null
  aiSummary: string | null
  isArchived: boolean
  createdAt: Date
}

export interface DopamineActivity {
  id: number
  name: string
  emoji: string
  description: string | null
  category: 'movement' | 'creative' | 'social' | 'sensory' | 'achievement' | 'nature'
  durationMinutes: number
  energyCost: 'low' | 'medium' | 'high'
  dopamineScore: number
  useCount: number
  lastUsedAt: Date | null
  isCustom: boolean
  createdAt: Date
}

export interface MoodLog {
  id: number
  date: string
  time: string
  mood: number
  energy: number
  focus: number
  emoji: string | null
  notes: string | null
  tags: string // JSON representation
  triggeredBy: string | null
  createdAt: Date
}

export interface AIConversation {
  id: number
  context: 'coach' | 'daily_plan' | 'task_breakdown' | 'evening_reflect' | 'crisis'
  provider: string
  model: string
  messages: string // JSON representation
  summary: string | null
  date: string
  createdAt: Date
}

export interface Achievement {
  id: number
  key: string
  name: string
  description: string
  emoji: string
  category: 'focus' | 'tasks' | 'habits' | 'consistency' | 'courage'
  unlockedAt: Date | null
  isUnlocked: boolean
}

export interface AppSettings {
  [key: string]: string
}
