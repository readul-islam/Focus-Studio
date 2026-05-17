const useUser = () => {
  const data = JSON.parse(localStorage.getItem('user') || 'null');
  const projects = JSON.parse(localStorage.getItem('project') || 'null');
  const selectedProject = JSON.parse(localStorage.getItem('selectedProject') || 'null');

  const setSelectedProject = (project: any) => {
    // Track the last used project so the select screen can highlight it
    localStorage.setItem('lastUsedProjectId', String(project.project_id));
    localStorage.setItem('selectedProject', JSON.stringify(project));
    window.location.href = '/dashboard';
  };

  return {
    user: data,
    isLoading: false,
    project: selectedProject ?? (projects ? projects[0] : null),
    projects: projects ?? [],
    setSelectedProject,
  };
};

export default useUser;
