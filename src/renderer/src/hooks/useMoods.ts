import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MoodLog } from '../../../preload/types'

export function useMoodLogsQuery(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['mood-logs', startDate, endDate],
    queryFn: () => window.api.moods.getMoodLogs(startDate, endDate)
  })
}

export function useCreateMoodLogMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (log: Partial<MoodLog>) => window.api.moods.createMoodLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-logs'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}
