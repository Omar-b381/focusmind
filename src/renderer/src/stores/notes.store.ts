import { create } from 'zustand'

interface NotesState {
  selectedNoteId: number | null
  setSelectedNoteId: (id: number | null) => void
  currentArea: string
  setCurrentArea: (area: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  isCreateModalOpen: boolean
  setCreateModalOpen: (open: boolean) => void
}

export const useNotesStore = create<NotesState>((set) => ({
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  currentArea: 'all',
  setCurrentArea: (area) => set({ currentArea: area }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isCreateModalOpen: false,
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}))
