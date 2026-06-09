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
  LearningMaterial,
  LearningPath,
  LearningModule,
  FlashcardDeck,
  Flashcard,
  FSRSReview,
  FeynmanSession,
  KnowledgeNode,
  LearningAnalytics
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
  LearningLesson,
  LearningPath,
  LearningModule,
  FlashcardDeck,
  Flashcard,
  FSRSReview,
  FeynmanSession,
  KnowledgeNode,
  LearningAnalytics
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
      learningPaths: {
        getPaths: () => Promise<LearningPath[]>
        getPathById: (id: number) => Promise<LearningPath | undefined>
        createPath: (path: Partial<LearningPath>) => Promise<LearningPath>
        updatePath: (id: number, updates: Partial<LearningPath>) => Promise<LearningPath>
        deletePath: (id: number) => Promise<boolean>
        getModules: (pathId: number) => Promise<LearningModule[]>
        updateModule: (id: number, updates: Partial<LearningModule>) => Promise<LearningModule>
        deleteModule: (id: number) => Promise<boolean>
        generatePath: (topic: string, goal: string, level: string, minutesPerDay: number, style: string) => Promise<LearningPath>
        importYoutubePlaylist: (url: string, whyStarted: string, commitment: string) => Promise<{ pathId: number }>
      }
      flashcards: {
        getDecks: () => Promise<FlashcardDeck[]>
        getDeckById: (id: number) => Promise<FlashcardDeck | undefined>
        createDeck: (deck: Partial<FlashcardDeck>) => Promise<FlashcardDeck>
        getCards: (deckId: number) => Promise<Flashcard[]>
        getDueCards: (deckId: number) => Promise<Flashcard[]>
        reviewCard: (cardId: number, rating: number) => Promise<{ card: any; xpAwarded: number }>
        generateCardsForModule: (deckId: number, moduleId: number, content: string) => Promise<Flashcard[]>
      }
      feynman: {
        getSessions: (moduleId?: number) => Promise<FeynmanSession[]>
        evaluateSession: (sessionData: { pathId?: number; moduleId?: number; concept: string; explanation: string; targetAudience?: string; durationMs?: number }) => Promise<FeynmanSession>
      }
      knowledgeMap: {
        getNodes: (pathId: number) => Promise<KnowledgeNode[]>
        saveNodes: (nodes: KnowledgeNode[]) => Promise<boolean>
        generateNodesFromPath: (pathId: number) => Promise<KnowledgeNode[]>
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
