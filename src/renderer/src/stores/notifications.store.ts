import { create } from 'zustand'

export interface ToastNotification {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'info' | 'dopamine'
  duration?: number
}

interface NotificationsState {
  notifications: ToastNotification[]
  addNotification: (notification: Omit<ToastNotification, 'id'>) => void
  dismissNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast = { ...notification, id }
    
    set((state) => ({
      notifications: [...state.notifications, toast],
    }))

    // Auto-dismiss
    const duration = notification.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }
  },

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}))
