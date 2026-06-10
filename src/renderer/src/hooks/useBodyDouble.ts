import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useBodyDoubleSessionsQuery() {
  return useQuery({
    queryKey: ['body-double-sessions'],
    queryFn: () => window.api.bodyDouble.getSessions()
  })
}

export function useStartBodyDoubleSessionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: {
      focusSessionId?: number
      personaName: string
      ambientType: 'silent' | 'subtle' | 'active'
      soundscape?: string
      checkInIntervalMin: number
      voiceEnabled: boolean
      plannedMinutes: number
    }) => window.api.bodyDouble.startSession(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-double-sessions'] })
    }
  })
}

export function useStopBodyDoubleSessionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ actualMinutes, completed }: { actualMinutes: number; completed: boolean }) =>
      window.api.bodyDouble.stopSession(actualMinutes, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-double-sessions'] })
    }
  })
}
