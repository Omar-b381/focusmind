import { create } from 'zustand'

export type TimerType = 'focus' | 'short_break' | 'long_break' | 'free_flow'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

interface FocusState {
  type: TimerType
  status: TimerStatus
  duration: number // in seconds
  elapsed: number // in seconds
  taskId: number | null
  projectId: number | null
  learningTrackId: number | null
  lessonId: number | null
  
  // Actions
  setSession: (
    type: TimerType,
    minutes: number,
    taskId?: number | null,
    projectId?: number | null,
    learningTrackId?: number | null,
    lessonId?: number | null
  ) => void
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  complete: () => void
  
  // Custom timer adjustments
  addMinutes: (minutes: number) => void
}

export const useFocusStore = create<FocusState>((set, get) => {
  let intervalId: any = null

  return {
    type: 'focus',
    status: 'idle',
    duration: 25 * 60,
    elapsed: 0,
    taskId: null,
    projectId: null,
    learningTrackId: null,
    lessonId: null,

    setSession: (type, minutes, taskId = null, projectId = null, learningTrackId = null, lessonId = null) => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      set({
        type,
        status: 'idle',
        duration: minutes * 60,
        elapsed: 0,
        taskId,
        projectId,
        learningTrackId,
        lessonId
      })
    },

    start: () => {
      const { status } = get()
      if (status === 'running') return

      set({ status: 'running' })

      // Standard tick function
      const runTick = () => {
        const { status, elapsed, duration } = get()
        if (status !== 'running') {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          return
        }

        if (elapsed >= duration) {
          get().complete()
        } else {
          set({ elapsed: elapsed + 1 })
        }
      }

      if (!intervalId) {
        intervalId = setInterval(runTick, 1000)
      }
    },

    pause: () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      set({ status: 'paused' })
    },

    reset: () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      set({ status: 'idle', elapsed: 0 })
    },

    tick: () => {
      const { elapsed, duration } = get()
      if (elapsed >= duration) {
        get().complete()
      } else {
        set({ elapsed: elapsed + 1 })
      }
    },

    complete: () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      set({ status: 'finished' })
      
      // Notify main process or store session
      const { taskId, projectId, learningTrackId, lessonId, type, duration, elapsed } = get()
      if (window.api && window.api.focus) {
        window.api.focus.createSession({
          taskId,
          projectId,
          learningTrackId,
          lessonId,
          type,
          plannedMinutes: Math.round(duration / 60),
          actualMinutes: Math.round(elapsed / 60),
          interrupted: false,
          startedAt: new Date(Date.now() - elapsed * 1000),
          endedAt: new Date(),
          date: new Date().toISOString().split('T')[0]
        }).catch(err => console.error('Error saving session:', err))
      }
    },

    addMinutes: (minutes) => {
      set((state) => ({
        duration: state.duration + minutes * 60
      }))
    }
  }
})
