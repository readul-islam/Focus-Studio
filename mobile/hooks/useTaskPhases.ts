import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectPhase } from '@focuspilot/shared';
import { api } from '@/lib/api';

async function fetchPhases(projectId: number): Promise<ProjectPhase[]> {
  const response = await api.get<ProjectPhase[]>('/projects/project-phases/', {
    params: { project_id: projectId },
  });
  return response.data;
}

async function seedPhases(projectId: number): Promise<ProjectPhase[]> {
  const response = await api.post<{ phases?: ProjectPhase[] }>(
    `/projects/project-phases/seed-defaults/?project_id=${projectId}`,
    {},
  );
  return response.data.phases ?? [];
}

export function useTaskPhases(projectId: number | null, onAutoSelectPhase?: (phaseId: number) => void) {
  const queryClient = useQueryClient();
  const seedAttempted = useRef(false);

  const query = useQuery({
    queryKey: ['projects/project-phases', projectId],
    queryFn: () => fetchPhases(projectId!),
    enabled: projectId != null,
  });

  useEffect(() => {
    seedAttempted.current = false;
  }, [projectId]);

  useEffect(() => {
    if (!projectId || query.isLoading || query.isError || (query.data?.length ?? 0) > 0 || seedAttempted.current) {
      return;
    }

    seedAttempted.current = true;
    seedPhases(projectId)
      .then(phases => {
        queryClient.setQueryData(['projects/project-phases', projectId], phases);
        const first = phases[0];
        if (first && onAutoSelectPhase) {
          onAutoSelectPhase(first.id);
        }
      })
      .catch(() => {
        seedAttempted.current = false;
      });
  }, [projectId, query.isLoading, query.isError, query.data, queryClient, onAutoSelectPhase]);

  return {
    phases: query.data ?? [],
    isLoading: query.isLoading || (query.data?.length === 0 && seedAttempted.current),
    isError: query.isError,
    refetch: query.refetch,
    seedPhases: async () => {
      if (!projectId) return [];
      const phases = await seedPhases(projectId);
      queryClient.setQueryData(['projects/project-phases', projectId], phases);
      return phases;
    },
  };
}
