'use client';

import { useCallback, useEffect, useState } from 'react';

const useUser = () => {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [projects, setProjects] = useState<Record<string, unknown>[]>([]);
  const [selectedProject, setSelectedProject] = useState<Record<string, unknown> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    setProjects(JSON.parse(localStorage.getItem('project') || 'null') ?? []);
    setSelectedProject(JSON.parse(localStorage.getItem('selectedProject') || 'null'));
    setHydrated(true);
  }, []);

  const setSelectedProjectAndGo = useCallback((project: Record<string, unknown>) => {
    localStorage.setItem('lastUsedProjectId', String(project.project_id));
    localStorage.setItem('selectedProject', JSON.stringify(project));
    setSelectedProject(project);
    window.location.href = '/dashboard';
  }, []);

  const project = selectedProject ?? (projects.length ? projects[0] : null);

  return {
    user: hydrated ? user : null,
    isLoading: !hydrated,
    project: hydrated ? project : null,
    projects: hydrated ? projects : [],
    setSelectedProject: setSelectedProjectAndGo,
  };
};

export default useUser;
