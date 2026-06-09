import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KnowledgeNode } from '../../../preload/types'

export function useKnowledgeNodesQuery(pathId: number) {
  return useQuery({
    queryKey: ['knowledge-nodes', pathId],
    queryFn: async () => {
      const data = await window.api.knowledgeMap.getNodes(pathId)
      // Check if any node is in the old coordinate system (negative or very close to 0)
      const hasOld = data.some(n => n.x < 20 || n.y < 20)
      if (hasOld) {
        return data.map(n => ({
          ...n,
          x: n.x + 350,
          y: n.y + 220
        }))
      }
      return data
    },
    enabled: !!pathId
  })
}

export function useSaveKnowledgeNodesMutation(pathId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nodes: KnowledgeNode[]) => window.api.knowledgeMap.saveNodes(nodes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-nodes', pathId] })
    }
  })
}

export function useGenerateKnowledgeNodesMutation(pathId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => window.api.knowledgeMap.generateNodesFromPath(pathId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-nodes', pathId] })
    }
  })
}
