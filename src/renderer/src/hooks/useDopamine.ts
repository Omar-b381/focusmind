import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DopamineActivity } from '../../../preload/types'

export function useDopamineActivitiesQuery() {
  return useQuery({
    queryKey: ['dopamine-activities'],
    queryFn: () => window.api.dopamine.getDopamineActivities()
  })
}

export function useCreateDopamineActivityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (activity: Partial<DopamineActivity>) => window.api.dopamine.createDopamineActivity(activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dopamine-activities'] })
    }
  })
}

export function useUseDopamineActivityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.dopamine.useDopamineActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dopamine-activities'] })
    }
  })
}
