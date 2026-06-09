import { create } from 'zustand'

interface XPState {
  level: number
  totalXP: number
  streakDays: number
  showLevelUp: boolean
  levelUpValue: number
  unlockedAchievement: { name: string; emoji: string } | null
  
  initializeXP: (totalXP: number, level: number, streakDays: number) => void
  addXP: (amount: number) => void
  triggerLevelUp: (newLevel: number) => void
  triggerAchievement: (name: string, emoji: string) => void
  dismissLevelUp: () => void
  dismissAchievement: () => void
}

export const useXPStore = create<XPState>((set) => ({
  level: 1,
  totalXP: 0,
  streakDays: 0,
  showLevelUp: false,
  levelUpValue: 1,
  unlockedAchievement: null,

  initializeXP: (totalXP, level, streakDays) => set({ totalXP, level, streakDays }),
  
  addXP: (amount) => set((state) => {
    const nextXP = state.totalXP + amount
    return { totalXP: nextXP }
  }),
  
  triggerLevelUp: (newLevel) => set({ showLevelUp: true, level: newLevel, levelUpValue: newLevel }),
  
  triggerAchievement: (name, emoji) => set({ unlockedAchievement: { name, emoji } }),
  
  dismissLevelUp: () => set({ showLevelUp: false }),
  
  dismissAchievement: () => set({ unlockedAchievement: null }),
}))
