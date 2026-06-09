import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => window.api.settings.getSettings()
  })
}

export function useUpdateSettingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      window.api.settings.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })
}
