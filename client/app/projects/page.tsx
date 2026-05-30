'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NewProjectDialog } from '@/components/project-wizard/new-project-dialog';
import { Plus, Calendar, Building, Store, Search } from 'lucide-react';
import { ProjectNavMain } from '@/components/project-nav-main';
import { Skeleton } from "@/components/ui/skeleton"
import useFetch from '@/hooks/useFetch';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectCardTable from '@/components/project/ProjectCardTable';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';


export default function ProjectsPage() {
  const t = useTranslations('projectsPage');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [project, setProject] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [data, setData] = useState<any[]>([]);
  const { data: projectsData, isLoading: projectsLoading } = useFetch('projects/user-projects/')
  const [searchQuery, setSearchQuery] = useState('');
  const { can } = usePermissions();
  const canCreateProject = can('projects.edit');

  useEffect(() => {
    document.title = 'Projects | Focuspilot';
  }, []);

  useEffect(() => {
    if (projectsData) {
      const mappedProjects = projectsData.map((item: any) => ({
        id: item.id,
        name: item.project_name,
        projectType:
          item.project_type === 'CM' ? 'Commercial' :
            item.project_type === 'RS' ? 'Residential' :
              item.project_type === 'HS' ? 'Hospitality' :
                item.project_type,
        status: item.project_status,
        code: item.project_code,
        startDate: item.start_date,
        endDate: item.end_date,
        budget: item.total_budget,
        spent: item.spent,
        progress: item.progress,
        nextMilestone: item.next_phase,
        currencyCode: item.currency, // Store just the code, not the full object
        client: item?.client?.name,
        phases: item.phases || [],
        assigned: Array.isArray(item.assignees)
          ? item.assignees.map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,

          }))
          : [], // Placeholder as API returns IDs only
        images: item?.project_banner, // Placeholder as API doesn't return images
        isArchive: false,
      }));
      setData(mappedProjects);
    }
  }, [projectsData]);

  useEffect(() => {
    if (projectsLoading) return;
    if (activeTab === 'all') {
      setProject(data);
    } else if (activeTab === 'active') {
      setProject(data?.filter(item => item.status == 'AC'));
    } else if (activeTab === 'completed') {
      setProject(data?.filter(item => item.status == 'COM'));
    } else if (activeTab === 'archived') {
      setProject(data?.filter(item => item.status == 'ARC'));
    }
  }, [data, activeTab]);

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return project;
    }

    const query = searchQuery.toLowerCase().trim();
    return project?.filter(item => {
      const name = item.name?.toLowerCase() || '';
      const code = item.code?.toLowerCase() || '';
      const client = item.client?.toLowerCase() || '';
      const projectType = item.projectType?.toLowerCase() || '';

      return (
        name.includes(query) ||
        code.includes(query) ||
        client.includes(query) ||
        projectType.includes(query)
      );
    });
  }, [project, searchQuery]);


  const completedProject = useMemo(() => {
    const completedProjects = data?.filter(item => item.status == 'COM')
    return completedProjects?.length || 0;
  }, [data]);

  const activeProject = useMemo(() => {
    const activeProjects = data?.filter(item => item.status == 'AC')
    return activeProjects?.length || 0;
  }, [data]);

  const archivedProject = useMemo(() => {
    const archivedProjects = data?.filter(item => item.status == 'ARC')
    return archivedProjects?.length || 0;
  }, [data]);

  return (
    <div className="flex-1 space-y-6 min-h-[calc(100svh-3.5rem)] bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <ProjectNavMain
            onChange={setActiveTab}
            activeTab={activeTab as any}
            counts={{
              active: activeProject,
              archived: archivedProject,
              all: data?.length,
              completed: completedProject,
            }}
          />

          {canCreateProject && (
            <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:opacity-90 h-11 px-6 rounded-xl shadow-sm"
            onClick={() => setShowNewProjectDialog(true)}
          >
            <Plus className="w-4 h-4" />
            {t('addProject')}
          </Button>
          )}
        </div>

        {/* Projects Content */}
        {/* Projects Grid */}
        <div className="grid grid-cols-1 animate-in fade-in slide-in-from-bottom-4 duration-500 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects &&
            filteredProjects?.length > 0 &&
            filteredProjects.map(project => {
              return (
                <ProjectCard key={project.id} project={project} />
              );
            })}
          {projectsLoading && <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-borderSoft">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-1 w-full" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-borderSoft">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="w-6 h-6 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}</>}
        </div>
      </div>


      {/* Empty State */}
      {!projectsLoading && filteredProjects?.length === 0 && (
        <div className="text-center py-16 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-muted/40 border border-border/40 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Calendar className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t('emptyTitle')}
          </h3>
          <p className="text-muted-foreground/80 text-sm mb-6 max-w-sm mx-auto">
            {t('emptySubtitle')}
          </p>
          <Button
            onClick={() => setShowNewProjectDialog(true)}
            className="bg-primary text-primary-foreground hover:opacity-90 h-11 px-6 rounded-xl shadow-sm font-semibold transition-all gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('newProject')}
          </Button>
        </div>
      )}

      {/* New Project Dialog */}
      <NewProjectDialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog} />
    </div>
  );
}
