import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Project } from '../../../preload/types'

export function useProjectsQuery() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => window.api.projects.getProjects()
  })
}

export function useProjectQuery(id: number) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => window.api.projects.getProjectById(id),
    enabled: !!id
  })
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (project: Partial<Project>) => window.api.projects.createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Project> }) =>
      window.api.projects.updateProject(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    }
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.projects.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useMoveToGraveyardMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason, lessons }: { id: number; reason: string; lessons: string }) =>
      window.api.projects.moveToGraveyard(id, reason, lessons),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    }
  })
}
