import { ElectronAPI } from '@electron-toolkit/preload'
import {
  Task,
  Project,
  FocusSession,
  Habit,
  HabitLog,
  BrainDump,
  DopamineActivity,
  DopamineLog,
  MoodLog,
  EnergyLog,
  XPLedgerEntry,
  Achievement,
  UserProfile,
  ContextSnapshot,
  AppSettings,
  LearningTrack,
  LearningLesson,
  LearningMaterial
} from './types'

export type {
  Task,
  Project,
  FocusSession,
  Habit,
  HabitLog,
  BrainDump,
  DopamineActivity,
  DopamineLog,
  MoodLog,
  EnergyLog,
  XPLedgerEntry,
  Achievement,
  UserProfile,
  ContextSnapshot,
  AppSettings,
  LearningTrack,
  LearningLesson
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
        getAIConversations: (context: string) => Promise<any[]>
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
      learningTracks: {
        getTracks: () => Promise<LearningTrack[]>
        getTrackById: (id: number) => Promise<LearningTrack | undefined>
        createTrack: (track: Partial<LearningTrack>) => Promise<LearningTrack>
        updateTrack: (id: number, track: Partial<LearningTrack>) => Promise<LearningTrack>
        deleteTrack: (id: number) => Promise<boolean>
        getLessons: (trackId: number) => Promise<LearningLesson[]>
        updateLesson: (id: number, lesson: Partial<LearningLesson>) => Promise<LearningLesson>
        deleteLesson: (id: number) => Promise<boolean>
        importYoutubePlaylist: (url: string, whyStarted: string, commitment: string) => Promise<{ trackId: number }>
      }
      learningMaterials: {
        getMaterials: (trackId?: number | null) => Promise<LearningMaterial[]>
        getMaterialById: (id: number) => Promise<LearningMaterial | undefined>
        createMaterial: (material: Partial<LearningMaterial>) => Promise<LearningMaterial>
        updateMaterial: (id: number, updates: Partial<LearningMaterial>) => Promise<LearningMaterial>
        deleteMaterial: (id: number) => Promise<boolean>
        generateSummaryAndConceptMap: (id: number) => Promise<LearningMaterial>
      }
      xp: {
        getLedger: () => Promise<XPLedgerEntry[]>
        addXP: (amount: number, reason: string, refId?: number, refType?: string) => Promise<XPLedgerEntry>
      }
      energy: {
        getEnergyLogs: (startDate: string, endDate: string) => Promise<EnergyLog[]>
        logEnergy: (hour: number, level: number) => Promise<EnergyLog>
      }
      userProfile: {
        getProfile: () => Promise<UserProfile>
        updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>
      }
      contextSnapshots: {
        getLatestSnapshot: (taskId?: number, projectId?: number, trackId?: number) => Promise<ContextSnapshot | undefined>
        saveSnapshot: (snapshot: Partial<ContextSnapshot>) => Promise<ContextSnapshot>
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
