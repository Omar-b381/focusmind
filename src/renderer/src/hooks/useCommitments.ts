import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Commitment } from '../../../preload/types'

export function useCommitmentsQuery() {
  return useQuery({
    queryKey: ['commitments'],
    queryFn: () => window.api.commitments.getCommitments()
  })
}

export function useCreateCommitmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commitment: Partial<Commitment>) => window.api.commitments.createCommitment(commitment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] })
    }
  })
}

export function useUpdateCommitmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Commitment> }) => window.api.commitments.updateCommitment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] })
    }
  })
}

export function useDeleteCommitmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.commitments.deleteCommitment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] })
    }
  })
}
