import { ElectronAPI } from '@electron-toolkit/preload'

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

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      tasks: {
        getTasks: (filters?: { status?: string; projectId?: number; energyLevel?: string }) => Promise<Task[]>
        getTaskById: (id: number) => Promise<Task | undefined>
        createTask: (task: Partial<Task>) => Promise<Task>
        updateTask: (id: number, task: Partial<Task>) => Promise<Task>
        deleteTask: (id: number) => Promise<boolean>
        suggestNextTask: () => Promise<Task | null>
        breakdownTask: (id: number) => Promise<{ steps: { title: string; done: boolean }[] }>
      }
      projects: {
        getProjects: () => Promise<Project[]>
        getProjectById: (id: number) => Promise<Project | undefined>
        createProject: (project: Partial<Project>) => Promise<Project>
        updateProject: (id: number, project: Partial<Project>) => Promise<Project>
        deleteProject: (id: number) => Promise<boolean>
        moveToGraveyard: (id: number, reason: string, lessons: string) => Promise<Project>
      }
      focus: {
        getSessions: (date?: string) => Promise<FocusSession[]>
        createSession: (session: Partial<FocusSession>) => Promise<FocusSession>
        updateSession: (id: number, session: Partial<FocusSession>) => Promise<FocusSession>
      }
      habits: {
        getHabits: () => Promise<Habit[]>
        createHabit: (habit: Partial<Habit>) => Promise<Habit>
        updateHabit: (id: number, habit: Partial<Habit>) => Promise<Habit>
        toggleHabit: (habitId: number, date: string, completed: boolean, notes?: string) => Promise<HabitLog>
        getHabitLogs: (startDate: string, endDate: string) => Promise<HabitLog[]>
      }
      brainDump: {
        getBrainDumps: () => Promise<BrainDump[]>
        createBrainDump: (content: string) => Promise<BrainDump>
        archiveBrainDump: (id: number) => Promise<boolean>
        convertToTask: (id: number, taskData: Partial<Task>) => Promise<Task>
      }
      dopamine: {
        getDopamineActivities: () => Promise<DopamineActivity[]>
        createDopamineActivity: (activity: Partial<DopamineActivity>) => Promise<DopamineActivity>
        useDopamineActivity: (id: number) => Promise<DopamineActivity>
      }
      moods: {
        getMoodLogs: (startDate: string, endDate: string) => Promise<MoodLog[]>
        createMoodLog: (log: Partial<MoodLog>) => Promise<MoodLog>
      }
      ai: {
        getAIConversations: (context: string) => Promise<AIConversation[]>
        sendChatMessage: (context: string, messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) => Promise<any>
        generateDailyPlan: (energyLevel: number, taskIds: number[]) => Promise<any>
        reflectEvening: (notes: string) => Promise<any>
      }
      analytics: {
        getAnalytics: (period: 'week' | 'month') => Promise<{
          focusMinutes: number
          tasksCompleted: number
          averageMood: number
          averageEnergy: number
          averageFocus: number
          dailyStats: { date: string; focusMinutes: number; tasksCompleted: number; mood: number }[]
        }>
      }
      settings: {
        getSettings: () => Promise<AppSettings>
        updateSetting: (key: string, value: string) => Promise<boolean>
      }
      system: {
        onBrainDumpHotkey: (callback: () => void) => () => void
        onFocusHotkey: (callback: () => void) => () => void
        showNotification: (title: string, body: string) => void
      }
    }
  }
}
