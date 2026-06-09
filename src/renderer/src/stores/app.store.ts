import { create } from 'zustand'

export type ActiveTab = 
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'focus'
  | 'habits'
  | 'dopamine'
  | 'coach'
  | 'analytics'
  | 'settings'
  | 'learning'
  | 'achievements'
  | 'flashcards'
  | 'flashcard-review'
  | 'feynman'
  | 'knowledgeMap'

interface AppState {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  
  // Brain Dump quick capture overlay
  isBrainDumpOpen: boolean
  setBrainDumpOpen: (open: boolean) => void
  toggleBrainDump: () => void

  // Check-in / Morning reflect modal
  isCheckInOpen: boolean
  setCheckInOpen: (open: boolean) => void

  // Selected task for focus (the "One Thing")
  selectedTaskId: number | null
  setSelectedTaskId: (id: number | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isBrainDumpOpen: false,
  setBrainDumpOpen: (open) => set({ isBrainDumpOpen: open }),
  toggleBrainDump: () => set((state) => ({ isBrainDumpOpen: !state.isBrainDumpOpen })),

  isCheckInOpen: false,
  setCheckInOpen: (open) => set({ isCheckInOpen: open }),

  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
}))
