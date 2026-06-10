import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { JournalEntry } from '../../../preload/types'

export function useJournalEntriesQuery() {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => window.api.journal.getEntries()
  })
}

export function useJournalEntryQuery(id: number | null) {
  return useQuery({
    queryKey: ['journal-entry', id],
    queryFn: () => (id ? window.api.journal.getEntryById(id) : Promise.resolve(undefined)),
    enabled: !!id
  })
}

export function useCreateJournalEntryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entry: Partial<JournalEntry>) => window.api.journal.createEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}

export function useUpdateJournalEntryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, entry }: { id: number; entry: Partial<JournalEntry> }) => window.api.journal.updateEntry(id, entry),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.invalidateQueries({ queryKey: ['journal-entry', variables.id] })
    }
  })
}

export function useDeleteJournalEntryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.journal.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    }
  })
}

export function useAnalyzeJournalEntryMutation() {
  return useMutation({
    mutationFn: ({ content, type }: { content: string; type: string }) => window.api.journal.analyzeEntry(content, type)
  })
}
