import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useFeynmanSessionsQuery(moduleId?: number) {
  return useQuery({
    queryKey: ['feynman-sessions', moduleId],
    queryFn: () => window.api.feynman.getSessions(moduleId)
  })
}

export function useEvaluateFeynmanSessionMutation(moduleId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionData: { pathId?: number; moduleId?: number; concept: string; explanation: string; targetAudience?: string; durationMs?: number }) =>
      window.api.feynman.evaluateSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feynman-sessions', moduleId] })
      queryClient.invalidateQueries({ queryKey: ['feynman-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['xp-ledger'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: ['learning-modules'] })
      }
    }
  })
}
