'use client';

import { useProjectContext } from '@/context/ProjectContext';

const useUser = () => {
  const data = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const {
    project,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    hydrateProjects,
    clearProjects,
    syncFromStorage,
  } = useProjectContext();

  return {
    user: data,
    isLoading: false,
    project,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    hydrateProjects,
    clearProjects,
    syncFromStorage,
  };
};

export default useUser;
