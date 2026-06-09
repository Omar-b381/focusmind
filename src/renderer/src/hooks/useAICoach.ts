import { useMutation } from '@tanstack/react-query'

export function useAIChatMutation() {
  return useMutation({
    mutationFn: ({ context, messages }: { context: string; messages: { role: 'user' | 'assistant' | 'system'; content: string }[] }) =>
      window.api.ai.sendChatMessage(context, messages)
  })
}

export function useDailyPlanMutation() {
  return useMutation({
    mutationFn: ({ energyLevel, taskIds }: { energyLevel: number; taskIds: number[] }) =>
      window.api.ai.generateDailyPlan(energyLevel, taskIds)
  })
}

export function useEveningReflectMutation() {
  return useMutation({
    mutationFn: (notes: string) => window.api.ai.reflectEvening(notes)
  })
}
