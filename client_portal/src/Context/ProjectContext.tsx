'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ClientProject = {
  id: number;
  project_id: number;
  project_name: string;
  currency?: string;
  created_at?: string;
};

const STORAGE_PROJECTS = 'projects';
const STORAGE_SELECTED = 'selectedProjectId';
const LEGACY_PROJECT_KEY = 'project';

function readProjects(): ClientProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS) || localStorage.getItem(LEGACY_PROJECT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readSelectedId(projects: ClientProject[]): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_SELECTED);
  if (stored) {
    const id = Number(stored);
    if (projects.some((p) => p.project_id === id)) return id;
  }
  return projects[0]?.project_id ?? null;
}

type ProjectContextValue = {
  projects: ClientProject[];
  project: ClientProject | null;
  selectedProjectId: number | null;
  setSelectedProjectId: (projectId: number) => void;
  hydrateProjects: (items: ClientProject[]) => void;
  clearProjects: () => void;
  syncFromStorage: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState<number | null>(null);

  useEffect(() => {
    const loaded = readProjects();
    setProjects(loaded);
    setSelectedProjectIdState(readSelectedId(loaded));
  }, []);

  const project = useMemo(
    () => projects.find((p) => p.project_id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const setSelectedProjectId = useCallback(
    (projectId: number) => {
      if (!projects.some((p) => p.project_id === projectId)) return;
      setSelectedProjectIdState(projectId);
      localStorage.setItem(STORAGE_SELECTED, String(projectId));
      queryClient.invalidateQueries();
    },
    [projects, queryClient],
  );

  const hydrateProjects = useCallback((items: ClientProject[]) => {
    setProjects(items);
    localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(items));
    localStorage.removeItem(LEGACY_PROJECT_KEY);
    const nextId = items[0]?.project_id ?? null;
    if (nextId != null) {
      setSelectedProjectIdState(nextId);
      localStorage.setItem(STORAGE_SELECTED, String(nextId));
    }
  }, []);

  const clearProjects = useCallback(() => {
    setProjects([]);
    setSelectedProjectIdState(null);
    localStorage.removeItem(STORAGE_PROJECTS);
    localStorage.removeItem(STORAGE_SELECTED);
    localStorage.removeItem(LEGACY_PROJECT_KEY);
  }, []);

  const syncFromStorage = useCallback(() => {
    const loaded = readProjects();
    setProjects(loaded);
    setSelectedProjectIdState(readSelectedId(loaded));
  }, []);

  const value = useMemo(
    () => ({
      projects,
      project,
      selectedProjectId,
      setSelectedProjectId,
      hydrateProjects,
      clearProjects,
      syncFromStorage,
    }),
    [projects, project, selectedProjectId, setSelectedProjectId, hydrateProjects, clearProjects, syncFromStorage],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return ctx;
}
