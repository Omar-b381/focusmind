import { create } from 'zustand'

export interface BodyDoubleMessage {
  text: string
  type: string
  timestamp: Date | string
}

interface BodyDoubleState {
  activeSession: any | null
  setActiveSession: (session: any | null) => void
  messages: BodyDoubleMessage[]
  addMessage: (msg: BodyDoubleMessage) => void
  clearMessages: () => void
  voiceEnabled: boolean
  setVoiceEnabled: (enabled: boolean) => void
  soundscape: string
  setSoundscape: (sound: string) => void
  personaName: string
  setPersonaName: (name: string) => void
  checkInIntervalMin: number
  setCheckInIntervalMin: (val: number) => void
  ambientType: 'silent' | 'subtle' | 'active'
  setAmbientType: (val: 'silent' | 'subtle' | 'active') => void
}

export const useBodyDoubleStore = create<BodyDoubleState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  voiceEnabled: false,
  setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
  soundscape: 'none',
  setSoundscape: (sound) => set({ soundscape: sound }),
  personaName: 'مرافق',
  setPersonaName: (name) => set({ personaName: name }),
  checkInIntervalMin: 10,
  setCheckInIntervalMin: (val) => set({ checkInIntervalMin: val }),
  ambientType: 'subtle',
  setAmbientType: (val) => set({ ambientType: val }),
}))
