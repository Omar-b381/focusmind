import { create } from 'zustand'
import { Flashcard } from '../../../preload/types'

interface ReviewState {
  deckId: number | null
  cards: Flashcard[]
  currentIndex: number
  showAnswer: boolean
  isFinished: boolean
  xpEarned: number
  startTime: number | null
  
  startSession: (deckId: number, cards: Flashcard[]) => void
  setShowAnswer: (show: boolean) => void
  rateCardInSession: (xpAwarded: number) => void
  nextCard: () => void
  endSession: () => void
}

export const useReviewStore = create<ReviewState>((set) => ({
  deckId: null,
  cards: [],
  currentIndex: 0,
  showAnswer: false,
  isFinished: false,
  xpEarned: 0,
  startTime: null,

  startSession: (deckId, cards) => set({
    deckId,
    cards,
    currentIndex: 0,
    showAnswer: false,
    isFinished: cards.length === 0,
    xpEarned: 0,
    startTime: Date.now()
  }),

  setShowAnswer: (show) => set({ showAnswer: show }),

  rateCardInSession: (xpAwarded) => set((state) => ({
    xpEarned: state.xpEarned + xpAwarded
  })),

  nextCard: () => set((state) => {
    const isLast = state.currentIndex >= state.cards.length - 1
    return {
      showAnswer: false,
      currentIndex: isLast ? state.currentIndex : state.currentIndex + 1,
      isFinished: isLast
    }
  }),

  endSession: () => set({
    deckId: null,
    cards: [],
    currentIndex: 0,
    showAnswer: false,
    isFinished: false,
    xpEarned: 0,
    startTime: null
  })
}))
