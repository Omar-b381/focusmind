import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FlashcardDeck } from '../../../preload/types'

export function useDecksQuery() {
  return useQuery({
    queryKey: ['flashcard-decks'],
    queryFn: () => window.api.flashcards.getDecks()
  })
}

export function useDeckQuery(id: number) {
  return useQuery({
    queryKey: ['flashcard-deck', id],
    queryFn: () => window.api.flashcards.getDeckById(id),
    enabled: !!id
  })
}

export function useCreateDeckMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deck: Partial<FlashcardDeck>) => window.api.flashcards.createDeck(deck),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
    }
  })
}

export function useCardsQuery(deckId: number) {
  return useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => window.api.flashcards.getCards(deckId),
    enabled: !!deckId
  })
}

export function useDueCardsQuery(deckId: number) {
  return useQuery({
    queryKey: ['due-flashcards', deckId],
    queryFn: () => window.api.flashcards.getDueCards(deckId),
    enabled: !!deckId
  })
}

export function useReviewCardMutation(deckId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, rating }: { cardId: number; rating: number }) =>
      window.api.flashcards.reviewCard(cardId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['due-flashcards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['flashcard-deck', deckId] })
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
      queryClient.invalidateQueries({ queryKey: ['xp-ledger'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] }) // Retention score update
    }
  })
}

export function useGenerateCardsMutation(deckId: number, moduleId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content }: { content: string }) =>
      window.api.flashcards.generateCardsForModule(deckId, moduleId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['due-flashcards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['flashcard-deck', deckId] })
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
      queryClient.invalidateQueries({ queryKey: ['learning-modules'] }) // cardCount update
    }
  })
}
