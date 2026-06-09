import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Task } from '../../../preload/types'

export function useBrainDumpsQuery() {
  return useQuery({
    queryKey: ['brain-dumps'],
    queryFn: () => window.api.brainDump.getBrainDumps()
  })
}

export function useCreateBrainDumpMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => window.api.brainDump.createBrainDump(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-dumps'] })
    }
  })
}

export function useArchiveBrainDumpMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.brainDump.archiveBrainDump(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-dumps'] })
    }
  })
}

export function useConvertToTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, taskData }: { id: number; taskData: Partial<Task> }) =>
      window.api.brainDump.convertToTask(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brain-dumps'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
