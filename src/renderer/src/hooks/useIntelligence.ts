import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePatternInsightsQuery() {
  return useQuery({
    queryKey: ['intelligence-insights'],
    queryFn: () => window.api.intelligence.getPatternInsights()
  })
}

export function useRefreshInsightsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => window.api.intelligence.refreshInsights(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence-insights'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-autopsy'] })
    }
  })
}

export function useWeeklyAutopsyQuery() {
  return useQuery({
    queryKey: ['weekly-autopsy'],
    queryFn: () => window.api.intelligence.getWeeklyAutopsy()
  })
}
