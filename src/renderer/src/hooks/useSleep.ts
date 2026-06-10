import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SleepLog } from '../../../preload/types'

export function useSleepLogsQuery(limit?: number) {
  return useQuery({
    queryKey: ['sleep-logs', limit],
    queryFn: () => window.api.sleep.getSleepLogs(limit)
  })
}

export function useLogSleepMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (log: Partial<SleepLog>) => window.api.sleep.logSleep(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep-logs'] })
      queryClient.invalidateQueries({ queryKey: ['intelligence-insights'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-autopsy'] })
    }
  })
}

export function useDeleteSleepLogMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.sleep.deleteSleepLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep-logs'] })
      queryClient.invalidateQueries({ queryKey: ['intelligence-insights'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-autopsy'] })
    }
  })
}
