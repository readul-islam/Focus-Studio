export type ContractorProjectSession = {
  project_id: number;
  project_name: string;
};

export function storeContractorSession(data: {
  access: string;
  refresh: string;
  contractor: Record<string, unknown>;
  project: { id: number; project_name: string };
}) {
  const projectEntry: ContractorProjectSession = {
    project_id: data.project.id,
    project_name: data.project.project_name,
  };

  localStorage.setItem('session_type', 'contractor');
  localStorage.setItem('access', data.access);
  localStorage.setItem('refresh', data.refresh);
  localStorage.setItem('user', JSON.stringify(data.contractor));
  localStorage.setItem('project', JSON.stringify([projectEntry]));
  localStorage.setItem('selectedProject', JSON.stringify(projectEntry));
  localStorage.setItem('lastUsedProjectId', String(data.project.id));
}
