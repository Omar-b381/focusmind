import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useXPStore } from '../stores/xp.store'
import { UserProfile } from '../../../preload/types'

export function useUserProfileQuery() {
  const initializeXP = useXPStore((state) => state.initializeXP)
  
  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => window.api.userProfile.getProfile()
  })

  useEffect(() => {
    if (query.data) {
      initializeXP(
        query.data.totalXP,
        query.data.level,
        query.data.currentStreakDays || 0
      )
    }
  }, [query.data, initializeXP])

  return query
}

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) => window.api.userProfile.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    }
  })
}

export function useXPLedgerQuery() {
  return useQuery({
    queryKey: ['xp-ledger'],
    queryFn: () => window.api.xp.getLedger()
  })
}

export function useAddXPMutation() {
  const queryClient = useQueryClient()
  const addXPLocal = useXPStore((state) => state.addXP)
  const triggerLevelUp = useXPStore((state) => state.triggerLevelUp)

  return useMutation({
    mutationFn: ({ amount, reason, refId, refType }: { amount: number; reason: string; refId?: number; refType?: string }) =>
      window.api.xp.addXP(amount, reason, refId, refType),
    onSuccess: (data: any) => {
      // data returned from xp:addXP should contain whether a levelUp occurred
      queryClient.invalidateQueries({ queryKey: ['xp-ledger'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      
      if (data) {
        addXPLocal(data.amount)
        if (data.leveledUp) {
          triggerLevelUp(data.level)
        }
      }
    }
  })
}
