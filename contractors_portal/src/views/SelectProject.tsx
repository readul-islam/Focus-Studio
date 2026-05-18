import { useEffect } from 'react';
import { useNavigate } from '@/lib/navigation';
import useUser from '@/hooks/userUser';
import useFetch from '@/hooks/useFetch';
import { Loader2, MapPin, Building2 } from 'lucide-react';

export default function SelectProject() {
  const navigate = useNavigate();
  const { user, projects, setSelectedProject } = useUser();
  const lastUsedProjectId = localStorage.getItem('lastUsedProjectId');

  // Fetch enriched project list (includes location)
  const { data: activeProjects, isLoading } = useFetch(
    `contractor_portal/active-projects/?contractor_id=${user?.id}`,
    { enabled: !!user?.id },
  );

  // If only one project, auto-select and redirect
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (projects.length === 1) {
      setSelectedProject(projects[0]);
    }
  }, [user, projects]);

  if (!user) return null;

  // Merge login projects (has currency) with active-projects (has location), last-used first
  const enriched = projects
    .map((p: any) => {
      const extra = activeProjects?.projects?.find((a: any) => a.id === p.project_id) ?? {};
      return { ...p, location: extra.location ?? null };
    })
    .sort((a: any, b: any) => {
      if (String(a.project_id) === lastUsedProjectId) return -1;
      if (String(b.project_id) === lastUsedProjectId) return 1;
      return 0;
    });

  const handleSelect = (project: any) => {
    setSelectedProject(project);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/brand/Logo.png" alt="Focuspilot" className="w-9 h-9" />
          <span className="font-semibold text-gray-900 text-lg">Focuspilot</span>
        </div>    
        <h1 className="text-2xl font-bold text-gray-900">Select a Project</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user.name}. Choose a project to continue.
        </p>
      </div>

      {/* Project Cards */}
      <div className="w-full max-w-lg space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          enriched.map((project: any) => (
            <button
              key={project.project_id}
              onClick={() => handleSelect(project)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm truncate">{project.project_name}</p>
                      {String(project.project_id) === lastUsedProjectId && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex-shrink-0 ring-1 ring-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Last used
                        </span>
                      )}
                    </div>
                    {project.location ? (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {project.location}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">No location set</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {project.currency}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
