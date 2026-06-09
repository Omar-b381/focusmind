import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LearningMaterial } from '../../../preload/types'

export function useMaterialsQuery(trackId?: number | null) {
  return useQuery({
    queryKey: ['learning-materials', trackId],
    queryFn: () => window.api.learningMaterials.getMaterials(trackId)
  })
}

export function useMaterialQuery(id: number) {
  return useQuery({
    queryKey: ['learning-material', id],
    queryFn: () => window.api.learningMaterials.getMaterialById(id),
    enabled: !!id
  })
}

export function useCreateMaterialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (material: Partial<LearningMaterial>) => window.api.learningMaterials.createMaterial(material),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] })
      if (variables.learningTrackId) {
        queryClient.invalidateQueries({ queryKey: ['learning-materials', variables.learningTrackId] })
      }
    }
  })
}

export function useUpdateMaterialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<LearningMaterial> }) =>
      window.api.learningMaterials.updateMaterial(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] })
      if (data && data.learningTrackId) {
        queryClient.invalidateQueries({ queryKey: ['learning-materials', data.learningTrackId] })
      }
      queryClient.invalidateQueries({ queryKey: ['learning-material', data?.id] })
    }
  })
}

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.learningMaterials.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] })
    }
  })
}

export function useGenerateSummaryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.learningMaterials.generateSummaryAndConceptMap(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] })
      if (data && data.learningTrackId) {
        queryClient.invalidateQueries({ queryKey: ['learning-materials', data.learningTrackId] })
      }
      queryClient.invalidateQueries({ queryKey: ['learning-material', data?.id] })
    }
  })
}
