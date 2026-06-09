import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FocusSession } from '../../../preload/types'

export function useFocusSessionsQuery(date?: string) {
  return useQuery({
    queryKey: ['focus-sessions', date],
    queryFn: () => window.api.focus.getSessions(date)
  })
}

export function useCreateFocusSessionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (session: Partial<FocusSession>) => window.api.focus.createSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}
