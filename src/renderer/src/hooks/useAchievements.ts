import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useAchievementsQuery() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => window.api.achievements.getAchievements()
  })
}

export function useUnlockAchievementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (key: string) => window.api.achievements.unlockAchievement(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    }
  })
}
