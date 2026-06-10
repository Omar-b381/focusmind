import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Note } from '../../../preload/types'

export function useNotesQuery(area?: string) {
  return useQuery({
    queryKey: ['notes', area],
    queryFn: () => window.api.notes.getNotes(area)
  })
}

export function useNoteQuery(id: number | null) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => (id ? window.api.notes.getNoteById(id) : Promise.resolve(undefined)),
    enabled: !!id
  })
}

export function useCreateNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (note: Partial<Note>) => window.api.notes.createNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: Partial<Note> }) => window.api.notes.updateNote(id, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['backlinks', variables.id] })
    }
  })
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.notes.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

export function useBacklinksQuery(id: number | null) {
  return useQuery({
    queryKey: ['backlinks', id],
    queryFn: () => (id ? window.api.notes.getBacklinks(id) : Promise.resolve([])),
    enabled: !!id
  })
}

export function useSuggestLinksQuery(id: number | null, content: string) {
  return useQuery({
    queryKey: ['suggest-links', id, content],
    queryFn: () => (id ? window.api.notes.suggestLinks(id, content) : Promise.resolve([])),
    enabled: !!id && !!content
  })
}
