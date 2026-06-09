import { ElectronAPI } from '@electron-toolkit/preload'
import {
  Task,
  Project,
  FocusSession,
  Habit,
  HabitLog,
  BrainDump,
  DopamineActivity,
  MoodLog,
  AIConversation,
  Achievement,
  AppSettings
} from './types'

export type {
  Task,
  Project,
  FocusSession,
  Habit,
  HabitLog,
  BrainDump,
  DopamineActivity,
  MoodLog,
  AIConversation,
  Achievement,
  AppSettings
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
      achievements: {
        getAchievements: () => Promise<Achievement[]>
        unlockAchievement: (key: string) => Promise<boolean>
      }
      system: {
        onBrainDumpHotkey: (callback: () => void) => () => void
        onFocusHotkey: (callback: () => void) => () => void
        showNotification: (title: string, body: string) => void
        exportData: () => Promise<boolean>
        importData: () => Promise<boolean>
      }
    }
  }
}
