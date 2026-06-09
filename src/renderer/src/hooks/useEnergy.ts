import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useEnergyStore } from '../stores/energy.store'

export function useEnergyLogsQuery(startDate: string, endDate: string) {
  const initializeEnergyLogs = useEnergyStore((state) => state.initializeEnergyLogs)

  const query = useQuery({
    queryKey: ['energy-logs', startDate, endDate],
    queryFn: () => window.api.energy.getEnergyLogs(startDate, endDate)
  })

  useEffect(() => {
    if (query.data) {
      // Map energy logs to structure expected by store initialization
      const logs = query.data.map((log: any) => ({
        hour: log.hour,
        energyLevel: log.energyLevel
      }))
      initializeEnergyLogs(logs)
    }
  }, [query.data, initializeEnergyLogs])

  return query
}

export function useLogEnergyMutation() {
  const queryClient = useQueryClient()
  const setHourlyEnergy = useEnergyStore((state) => state.setHourlyEnergy)
  const setCurrentEnergy = useEnergyStore((state) => state.setCurrentEnergy)

  return useMutation({
    mutationFn: ({ hour, level }: { hour: number; level: number }) =>
      window.api.energy.logEnergy(hour, level),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['energy-logs'] })
      if (data) {
        setHourlyEnergy(data.hour, data.energyLevel)
        // Also update the current energy to the latest log
        setCurrentEnergy(data.energyLevel)
      }
    }
  })
}
