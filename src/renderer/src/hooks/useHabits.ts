import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Habit } from '../../../preload/types'

export function useHabitsQuery() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: () => window.api.habits.getHabits()
  })
}

export function useCreateHabitMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (habit: Partial<Habit>) => window.api.habits.createHabit(habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })
}

export function useToggleHabitMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ habitId, date, completed, notes }: { habitId: number; date: string; completed: boolean; notes?: string }) =>
      window.api.habits.toggleHabit(habitId, date, completed, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] })
    }
  })
}

export function useHabitLogsQuery(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['habit-logs', startDate, endDate],
    queryFn: () => window.api.habits.getHabitLogs(startDate, endDate)
  })
}
