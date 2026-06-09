import { create } from 'zustand'

export interface Settings {
  aiProvider: 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openrouter' | 'custom'
  aiModel: string
  aiApiKey: string
  aiCustomEndpoint: string
  focusDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  soundEnabled: boolean
  notificationsEnabled: boolean
  accentColor: string
  theme: 'dark' | 'light'
  hasCompletedCheckInToday: boolean
  checkInDate: string // YYYY-MM-DD
}

interface SettingsState {
  settings: Settings
  isLoading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>
}

const defaultSettings: Settings = {
  aiProvider: 'gemini',
  aiModel: 'gemini-1.5-flash',
  aiApiKey: '',
  aiCustomEndpoint: '',
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEnabled: true,
  notificationsEnabled: true,
  accentColor: '#6366f1',
  theme: 'dark',
  hasCompletedCheckInToday: false,
  checkInDate: '',
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      if (window.api && window.api.settings) {
        const dbSettings = await window.api.settings.getSettings()
        
        // Merge DB settings onto defaults
        const merged: Settings = { ...defaultSettings }
        Object.entries(dbSettings).forEach(([key, value]) => {
          if (key in defaultSettings) {
            // Handle booleans/numbers conversion from string
            if (typeof defaultSettings[key] === 'boolean') {
              (merged as any)[key] = value === 'true' || value === '1'
            } else if (typeof defaultSettings[key] === 'number') {
              (merged as any)[key] = Number(value)
            } else {
              (merged as any)[key] = value
            }
          }
        })

        // Check if checkin is from today
        const todayStr = new Date().toISOString().split('T')[0]
        if (merged.checkInDate !== todayStr) {
          merged.hasCompletedCheckInToday = false
        }

        set({ settings: merged, isLoading: false })
      } else {
        // Fallback for environment without electron api
        set({ isLoading: false })
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err)
      set({ error: err.message || 'Failed to load settings', isLoading: false })
    }
  },

  updateSetting: async (key, value) => {
    // Optimistic update
    const prevSettings = get().settings
    const updated = { ...prevSettings, [key]: value }
    
    // If updating checkInDate, automatically set hasCompletedCheckInToday
    if (key === 'checkInDate') {
      const todayStr = new Date().toISOString().split('T')[0]
      updated.hasCompletedCheckInToday = value === todayStr
    }

    set({ settings: updated })

    try {
      if (window.api && window.api.settings) {
        // Serialize value to string for DB settings table
        const valStr = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)
        await window.api.settings.updateSetting(key, valStr)
      }
    } catch (err) {
      console.error(`Error saving setting ${key}:`, err)
      // Rollback on error
      set({ settings: prevSettings })
    }
  }
}))
