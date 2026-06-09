import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LearningPath, LearningModule } from '../../../preload/types'

export function usePathsQuery() {
  return useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => window.api.learningPaths.getPaths()
  })
}

export function usePathQuery(id: number) {
  return useQuery({
    queryKey: ['learning-path', id],
    queryFn: () => window.api.learningPaths.getPathById(id),
    enabled: !!id
  })
}

export function useCreatePathMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (path: Partial<LearningPath>) => window.api.learningPaths.createPath(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
    }
  })
}

export function useUpdatePathMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<LearningPath> }) =>
      window.api.learningPaths.updatePath(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({ queryKey: ['learning-path', variables.id] })
    }
  })
}

export function useDeletePathMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.learningPaths.deletePath(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
    }
  })
}

export function useModulesQuery(pathId: number) {
  return useQuery({
    queryKey: ['learning-modules', pathId],
    queryFn: () => window.api.learningPaths.getModules(pathId),
    enabled: !!pathId
  })
}

export function useUpdateModuleMutation(pathId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<LearningModule> }) =>
      window.api.learningPaths.updateModule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-modules', pathId] })
      queryClient.invalidateQueries({ queryKey: ['learning-path', pathId] })
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({ queryKey: ['xp-ledger'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    }
  })
}

export function useDeleteModuleMutation(pathId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.learningPaths.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-modules', pathId] })
      queryClient.invalidateQueries({ queryKey: ['learning-path', pathId] })
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
    }
  })
}

export function useGeneratePathMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ topic, goal, level, minutesPerDay, style }: { topic: string; goal: string; level: string; minutesPerDay: number; style: string }) =>
      window.api.learningPaths.generatePath(topic, goal, level, minutesPerDay, style),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
    }
  })
}

export function useImportYoutubePlaylistMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ url, whyStarted, commitment }: { url: string; whyStarted: string; commitment: string }) =>
      window.api.learningPaths.importYoutubePlaylist(url, whyStarted, commitment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
    }
  })
}
