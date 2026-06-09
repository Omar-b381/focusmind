import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Task } from '../../../preload/types'

export function useTasksQuery(filters?: { status?: string; projectId?: number; energyLevel?: string }) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => window.api.tasks.getTasks(filters)
  })
}

export function useTaskQuery(id: number) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => window.api.tasks.getTaskById(id),
    enabled: !!id
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (task: Partial<Task>) => window.api.tasks.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['suggested-task'] })
    }
  })
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) =>
      window.api.tasks.updateTask(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['suggested-task'] })
    }
  })
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.tasks.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['suggested-task'] })
    }
  })
}

export function useSuggestNextTaskQuery() {
  return useQuery({
    queryKey: ['suggested-task'],
    queryFn: () => window.api.tasks.suggestNextTask()
  })
}

export function useBreakdownTaskMutation() {
  return useMutation({
    mutationFn: (id: number) => window.api.tasks.breakdownTask(id)
  })
}
