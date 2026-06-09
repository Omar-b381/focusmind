import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LearningTrack, LearningLesson } from '../../../preload/types'

export function useTracksQuery() {
  return useQuery({
    queryKey: ['learning-tracks'],
    queryFn: () => window.api.learningTracks.getTracks()
  })
}

export function useTrackQuery(id: number) {
  return useQuery({
    queryKey: ['learning-track', id],
    queryFn: () => window.api.learningTracks.getTrackById(id),
    enabled: !!id
  })
}

export function useCreateTrackMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (track: Partial<LearningTrack>) => window.api.learningTracks.createTrack(track),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tracks'] })
    }
  })
}

export function useUpdateTrackMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<LearningTrack> }) =>
      window.api.learningTracks.updateTrack(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-tracks'] })
      queryClient.invalidateQueries({ queryKey: ['learning-track', variables.id] })
    }
  })
}

export function useDeleteTrackMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.learningTracks.deleteTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tracks'] })
    }
  })
}

export function useLessonsQuery(trackId: number) {
  return useQuery({
    queryKey: ['learning-lessons', trackId],
    queryFn: () => window.api.learningTracks.getLessons(trackId),
    enabled: !!trackId
  })
}

export function useUpdateLessonMutation(trackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<LearningLesson> }) =>
      window.api.learningTracks.updateLesson(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-lessons', trackId] })
      queryClient.invalidateQueries({ queryKey: ['learning-track', trackId] })
      queryClient.invalidateQueries({ queryKey: ['learning-tracks'] })
      // Invalidating profile or achievements since lessons might credit XP / unlock achievements
      queryClient.invalidateQueries({ queryKey: ['xp-ledger'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    }
  })
}
