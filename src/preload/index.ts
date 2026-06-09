import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Expose custom API for renderer
export const api = {
  // Tasks
  tasks: {
    getTasks: (filters?: any) => ipcRenderer.invoke('tasks:getTasks', filters),
    getTaskById: (id: number) => ipcRenderer.invoke('tasks:getTaskById', id),
    createTask: (task: any) => ipcRenderer.invoke('tasks:createTask', task),
    updateTask: (id: number, task: any) => ipcRenderer.invoke('tasks:updateTask', id, task),
    deleteTask: (id: number) => ipcRenderer.invoke('tasks:deleteTask', id),
    suggestNextTask: () => ipcRenderer.invoke('tasks:suggestNextTask'),
    breakdownTask: (id: number) => ipcRenderer.invoke('tasks:breakdownTask', id),
  },
  // Projects
  projects: {
    getProjects: () => ipcRenderer.invoke('projects:getProjects'),
    getProjectById: (id: number) => ipcRenderer.invoke('projects:getProjectById', id),
    createProject: (project: any) => ipcRenderer.invoke('projects:createProject', project),
    updateProject: (id: number, project: any) => ipcRenderer.invoke('projects:updateProject', id, project),
    deleteProject: (id: number) => ipcRenderer.invoke('projects:deleteProject', id),
    moveToGraveyard: (id: number, reason: string, lessons: string) => 
      ipcRenderer.invoke('projects:moveToGraveyard', id, reason, lessons),
  },
  // Focus sessions
  focus: {
    getSessions: (date?: string) => ipcRenderer.invoke('focus:getSessions', date),
    createSession: (session: any) => ipcRenderer.invoke('focus:createSession', session),
    updateSession: (id: number, session: any) => ipcRenderer.invoke('focus:updateSession', id, session),
  },
  // Habits
  habits: {
    getHabits: () => ipcRenderer.invoke('habits:getHabits'),
    createHabit: (habit: any) => ipcRenderer.invoke('habits:createHabit', habit),
    updateHabit: (id: number, habit: any) => ipcRenderer.invoke('habits:updateHabit', id, habit),
    toggleHabit: (habitId: number, date: string, completed: boolean, notes?: string) => 
      ipcRenderer.invoke('habits:toggleHabit', habitId, date, completed, notes),
    getHabitLogs: (startDate: string, endDate: string) => ipcRenderer.invoke('habits:getHabitLogs', startDate, endDate),
  },
  // Brain dumps
  brainDump: {
    getBrainDumps: () => ipcRenderer.invoke('brainDump:getBrainDumps'),
    createBrainDump: (content: string) => ipcRenderer.invoke('brainDump:createBrainDump', content),
    archiveBrainDump: (id: number) => ipcRenderer.invoke('brainDump:archiveBrainDump', id),
    convertToTask: (id: number, taskData: any) => ipcRenderer.invoke('brainDump:convertToTask', id, taskData),
  },
  // Dopamine activities
  dopamine: {
    getDopamineActivities: () => ipcRenderer.invoke('dopamine:getDopamineActivities'),
    createDopamineActivity: (activity: any) => ipcRenderer.invoke('dopamine:createDopamineActivity', activity),
    useDopamineActivity: (id: number) => ipcRenderer.invoke('dopamine:useDopamineActivity', id),
  },
  // Mood logs
  moods: {
    getMoodLogs: (startDate: string, endDate: string) => ipcRenderer.invoke('moods:getMoodLogs', startDate, endDate),
    createMoodLog: (log: any) => ipcRenderer.invoke('moods:createMoodLog', log),
  },
  // AI Coach
  ai: {
    getAIConversations: (context: string) => ipcRenderer.invoke('ai:getAIConversations', context),
    sendChatMessage: (context: string, messages: any[]) => ipcRenderer.invoke('ai:sendChatMessage', context, messages),
    generateDailyPlan: (energyLevel: number, taskIds: number[]) => 
      ipcRenderer.invoke('ai:generateDailyPlan', energyLevel, taskIds),
    reflectEvening: (notes: string) => ipcRenderer.invoke('ai:reflectEvening', notes),
  },
  // Analytics
  analytics: {
    getAnalytics: (period: 'week' | 'month') => ipcRenderer.invoke('analytics:getAnalytics', period),
  },
  // Settings
  settings: {
    getSettings: () => ipcRenderer.invoke('settings:getSettings'),
    updateSetting: (key: string, value: any) => ipcRenderer.invoke('settings:updateSetting', key, value),
  },
  // Achievements
  achievements: {
    getAchievements: () => ipcRenderer.invoke('achievements:getAchievements'),
    unlockAchievement: (key: string) => ipcRenderer.invoke('achievements:unlockAchievement', key),
  },
  // System / Hotkeys
  system: {
    onBrainDumpHotkey: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('hotkey:brain-dump', listener)
      return () => {
        ipcRenderer.removeListener('hotkey:brain-dump', listener)
      }
    },
    onFocusHotkey: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('hotkey:focus-timer', listener)
      return () => {
        ipcRenderer.removeListener('hotkey:focus-timer', listener)
      }
    },
    showNotification: (title: string, body: string) => ipcRenderer.send('system:showNotification', title, body),
    exportData: () => ipcRenderer.invoke('system:exportData'),
    importData: () => ipcRenderer.invoke('system:importData'),
  }
}

// Expose APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Error exposing APIs to main world:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
