import { useQuery } from '@tanstack/react-query'

export function useAnalyticsQuery(period: 'week' | 'month') {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => window.api.analytics.getAnalytics(period)
  })
}
