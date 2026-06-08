import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ProjectOverviewData, ProjectPhase } from '@focuspilot/shared';
import { api } from '@/lib/api';
import { mapProjectHub, type ProjectHubView } from '@/lib/project-detail';

interface ProjectHubContextValue {
  projectId: string;
  hubProject: ProjectHubView | undefined;
  overview: ProjectOverviewData | undefined;
  phases: ProjectPhase[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
  projectName: string;
  progress: number;
}

const ProjectHubContext = createContext<ProjectHubContextValue | null>(null);

async function fetchProject(id: string): Promise<ProjectHubView> {
  const response = await api.get<Record<string, unknown>>(`/projects/projects/${id}/`);
  return mapProjectHub(response.data);
}

async function fetchOverview(id: string): Promise<ProjectOverviewData> {
  const response = await api.get<ProjectOverviewData>(`/projects/project-overview/`, {
    params: { project_id: id },
  });
  return response.data;
}

async function fetchPhases(id: string): Promise<ProjectPhase[]> {
  const response = await api.get<ProjectPhase[]>('/projects/project-phases/', {
    params: { project_id: id },
  });
  return response.data;
}

export function ProjectHubProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const projectQuery = useQuery({
    queryKey: ['projects/projects', projectId],
    queryFn: () => fetchProject(projectId),
    enabled: Boolean(projectId),
  });

  const overviewQuery = useQuery({
    queryKey: ['projects/project-overview', projectId],
    queryFn: () => fetchOverview(projectId),
    enabled: Boolean(projectId),
  });

  const phasesQuery = useQuery({
    queryKey: ['projects/project-phases', projectId],
    queryFn: () => fetchPhases(projectId),
    enabled: Boolean(projectId),
  });

  const hubProject = projectQuery.data;
  const overview = overviewQuery.data;
  const phases = phasesQuery.data ?? [];

  const progress = useMemo(() => {
    if (typeof hubProject?.progress === 'number') return hubProject.progress;
    const total = overview?.tasks?.total ?? 0;
    const completed = overview?.tasks?.completed ?? 0;
    if (total > 0) return Math.round((completed / total) * 100);
    return overview?.tasks?.completion_percentage ?? 0;
  }, [hubProject?.progress, overview?.tasks]);

  const value = useMemo<ProjectHubContextValue>(
    () => ({
      projectId,
      hubProject,
      overview,
      phases,
      isLoading: projectQuery.isLoading && !projectQuery.data,
      isError: projectQuery.isError && !projectQuery.data,
      isRefetching:
        projectQuery.isRefetching || overviewQuery.isRefetching || phasesQuery.isRefetching,
      refetch: () => {
        projectQuery.refetch();
        overviewQuery.refetch();
        phasesQuery.refetch();
      },
      projectName: hubProject?.name ?? 'Project',
      progress,
    }),
    [projectId, hubProject, overview, phases, projectQuery, overviewQuery, phasesQuery, progress],
  );

  return <ProjectHubContext.Provider value={value}>{children}</ProjectHubContext.Provider>;
}

export function useProjectHub() {
  const ctx = useContext(ProjectHubContext);
  if (!ctx) {
    throw new Error('useProjectHub must be used within ProjectHubProvider');
  }
  return ctx;
}
