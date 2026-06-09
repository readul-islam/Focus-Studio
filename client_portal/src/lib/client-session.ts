export function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('projects');
  localStorage.removeItem('selectedProjectId');
  localStorage.removeItem('project');
}
