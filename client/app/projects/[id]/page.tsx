'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Edit,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Package,
  TrendingUp,
  FileText,
  ArrowRight,
  Upload,
  X,
  Presentation,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import projectCover from '/public/project_cover.jpg';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { gooeyToast } from 'goey-toast';
import usePatch from '@/hooks/usePatch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useFetch from '@/hooks/useFetch';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTranslations } from 'next-intl';
dayjs.extend(advancedFormat);

const getPaymentScheduleName = (id: string) => {
  const paymentSchedules = [
    { id: 'FF', name: '50/50 Split', description: '50% upfront, 50% on completion' },
    { id: 'TP', name: 'Three Payments', description: '33% upfront, 33% midway, 34% completion' },
    { id: 'PF', name: 'Per Phase', description: 'Payment aligned with project phases' },
    { id: 'M', name: 'Monthly', description: 'Equal monthly payments over project duration' },
  ];

  return paymentSchedules.find(item => item.id === id)?.name || '';
};

const blockers = [
  {
    id: 1,
    title: 'No Active Blocker',
    assignee: 'Sarah Wilson',
    priority: 'high',
    daysBlocked: 3,
    avatar: 'SW',
  },
];

const formatTodayDate = () => {
  return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function ProjectOverviewPageContent({ params }: { params: { id: string } }) {
  const t = useTranslations('projectOverviewPage');
  const [uploadModal, setUploadModal] = useState(false);
  const [file, setFile] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [phaseProgressMap, setPhaseProgressMap] = useState<Record<number, number>>({});
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const projectEditPermission = can('projects.edit');
  const { data: projectData, isLoading: projectLoading, refetch,isError: projectError } = useFetch(`projects/projects/${params?.id}`, { enabled: !!params?.id });
  const {
    data: projectOverviewData,
    isLoading: projectOverviewLoading,
    refetch: refetchProject,
    
  } = useFetch(`projects/project-overview?project_id=${params?.id}`, { enabled: !!params?.id });
  const {
    data: projectPhasesData,
    isLoading: projectPhasesLoading,
    refetch: refetchPhases,
  } = useFetch(`projects/project-phases/?project_id=${params?.id}`, { enabled: !!params?.id });

  useEffect(() => {
    document.title = `${projectData?.project_name || 'Project Overview'} | Focuspilot`;
  }, [projectData]);

  // Initialize phase progress map from API data
  useEffect(() => {
    if (projectPhasesData?.length) {
      const progressMap: Record<number, number> = {};
      projectPhasesData.forEach((phase: any) => {
        progressMap[phase.id] = phase.progress ?? 0;
      });
      setPhaseProgressMap(progressMap);
    }
  }, [projectPhasesData]);

  const UploadCloseModal = () => {
    setUploadModal(false);
    setFile([]);
  };
  const openUploadModal = () => setUploadModal(true);

  // Image Upload Function
  const attachmentMutation = usePatch({
    onSuccess: () => {
      setFile([]);
      refetch();
      UploadCloseModal();
    },
  });

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      // Limit to 1 file
      const fileToUpload = droppedFiles[0];

      if (fileToUpload.size > 20 * 1024 * 1024) {
        // 20MB
        setError('File exceeds the 20MB limit');
        return;
      }

      if (!fileToUpload.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      const processedFile = Object.assign(fileToUpload, {
        preview: URL.createObjectURL(fileToUpload),
        originalName: fileToUpload.name,
        id: Math.random().toString(36).substring(2),
      });

      setFile([processedFile]); // Replace existing
      setError('');
    }
  };

  const handleSelectByClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      const fileToUpload = selectedFiles[0];
      if (fileToUpload.size > 20 * 1024 * 1024) {
        setError('File exceeds the 20MB limit');
        return;
      }
      if (!fileToUpload.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      const processedFile = Object.assign(fileToUpload, {
        preview: URL.createObjectURL(fileToUpload),
        originalName: fileToUpload.name,
        id: Math.random().toString(36).substring(2),
      });
      setFile([processedFile]);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    if (file[0] && (file[0] as any).preview) {
      URL.revokeObjectURL((file[0] as any).preview);
    }
    setFile([]);
  };

  const handleFileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file.length) return;
    const formData = new FormData();
    formData.append('project_banner', file[0]);
    gooeyToast.promise(attachmentMutation.mutateAsync({ url: `projects/projects/${params.id}/`, data: formData }), {
      loading: 'Uploading...',
      success: 'Uploaded successfully!',
      error: (err: any) => `Upload failed: ${err?.message || 'Unknown error'}`,
    });
  };

  // Mutation for updating phase progress
  const updatePhaseMutation = usePatch({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`projects/project-phases/?project_id=${params?.id}`] });
      refetchPhases();
    },
  });

  // Debounced update function
  const debouncedUpdatePhase = useRef(
    debounce((phaseId: number, progress: number) => {
      updatePhaseMutation.mutate({ url: `projects/phases/${phaseId}/`, data: { progress } });
    }, 800),
  ).current;

  useEffect(() => {
    return () => {
      debouncedUpdatePhase.cancel();
    };
  }, [debouncedUpdatePhase]);

  const updatePhase = (phaseId: number, progress: number) => {
    // Optimistically update local state for immediate UI feedback
    setPhaseProgressMap(prev => ({
      ...prev,
      [phaseId]: progress,
    }));

    // Debounce the API call
    debouncedUpdatePhase(phaseId, progress);
  };
  

  return (
    <div className="">
      <div className="space-y-6 ">
        {/* Hero Header */}
        <Card className="border animate-in fade-in slide-in-from-bottom-3 duration-400 border-greige-500/30 shadow-sm overflow-hidden">
          <div className="relative h-48">
            <Image
              width={800}
              height={400}
              className="w-full brightness-75 h-full object-cover"
              src={projectData?.project_banner || projectCover}
              alt=""
              loading="lazy"
            />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-start justify-between">
                <div className="text-white drop-shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{projectData?.project_name}</h1>
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-sage-300/30 text-white/90 backdrop-blur-sm border border-white/20">
                      {t('onTrack')}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-sm">
                    {projectData?.client && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {projectData?.client?.name}
                      </div>
                    )}
                    {(projectData?.location || projectData?.city || projectData?.country) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{projectData?.location || `${projectData?.city}, ${projectData?.country}`}</span>
                      </div>
                    )}
                  </div>
                </div>
          {projectEditPermission &&      <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={openUploadModal}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('edit')}
                </Button>}
              </div>
            </div>
          </div>
        </Card>

        {/* KPI Rail */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiStats.map((stat) => (
            <Card
              key={stat.title}
              className="border border-greige-500/30 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-slatex-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700">
                      {stat.title}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-600">{stat.subtitle}</p>
                    <p className={`text-xs mt-1 ${stat.color}`}>{stat.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}

        <div className="grid animate-in fade-in slide-in-from-bottom-3 duration-400 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Budget Utilization Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* <DollarSign className="w-4 h-4 text-slatex-600" /> */}
                <span className="text-slate-600">
                  <ViewCurrencySymbol code={projectData?.currency} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">{t('budgetUtilization')}</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    <ViewCurrencySymbol code={projectData?.currency} />
                    {Number(projectOverviewData?.budget_utilization?.total_budget ?? 0).toLocaleString('en-GB', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {projectOverviewData?.budget_utilization?.percentage ?? 0}% of <ViewCurrencySymbol code={projectData?.currency} />
                    {Number(projectOverviewData?.budget_utilization?.total_budget ?? 0).toLocaleString('en-GB', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {t('utilized')}
                  </p>
                  <p className="text-xs mt-1 text-olive-700">
                    <ViewCurrencySymbol code={projectData?.currency} />
                    {Number(projectOverviewData?.budget_utilization?.total_po_amount ?? 0).toLocaleString('en-GB', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {t('spent')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">Profit Margin</p>
                  <p className="text-lg font-semibold text-neutral-900">0%</p>
                  <p className="text-xs text-neutral-600">
                    <ViewCurrencySymbol code={projectData?.currency} />0 projected
                  </p>
                  <p className="text-xs mt-1 text-olive-700">+2% vs estimate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Complete Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-slate-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">{t('tasksComplete')}</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {projectOverviewData?.tasks?.completed ?? 0}/{projectOverviewData?.tasks?.total ?? 0}
                  </p>
                  <p className="text-xs text-neutral-600">{t('completion', { percent: projectOverviewData?.tasks?.completion_percentage ?? 0 })}</p>
                  {projectOverviewData?.tasks?.remaining > 0 ? (
                    <p className="text-xs mt-1 text-ochre-700">{t('remaining', { count: projectOverviewData?.tasks?.remaining })}</p>
                  ) : (
                    <p className="text-xs mt-1 text-olive-700">{t('allTasksCompleted')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* POs Delayed Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4 h-full">
              <div className="flex h-full  items-center gap-3">
                <AlertTriangle className="w-4  h-4 text-slate-600" />
                <div className="flex-1  min-w-0">
                  <p className="text-sm font-medium text-neutral-700">{t('posDelayed')}</p>
                  <p className="text-lg font-semibold text-neutral-900">{projectOverviewData?.pos_delayed?.count ?? 0}</p>
                  {projectOverviewData?.procurement_status?.pos_needing_approval > 0 && (
                    <p className="text-xs text-neutral-600">
                      {t('needApproval', { count: projectOverviewData?.procurement_status?.pos_needing_approval })}
                    </p>
                  )}
                  {projectOverviewData?.procurement_status?.action_required ? (
                    <p className="text-xs mt-1 text-terracotta-600">{t('actionRequired')}</p>
                  ) : (
                    <p className="text-xs mt-1 text-olive-700">{t('noActionRequired')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Stripe */}
        <Card className="border animate-in fade-in slide-in-from-bottom-3 duration-500 border-greige-500/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-900">{t('projectTimeline')}</h3>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Calendar className="w-4 h-4" />
                <span>{t('today', { date: formatTodayDate() })}</span>
              </div>
            </div>
            <div className="relative">
              {/* Project Phases */}
              {projectPhasesData?.length && (
                <div className={`flex flex-wrap md:flex-nowrap items-center justify-between gap-5 `}>
                  {projectPhasesData?.map((phase: any) => {
                    const now = new Date();
                    // Convert start and end dates to Date objects (using snake_case field names)
                    const start = phase.start_date ? new Date(phase.start_date) : null;
                    const end = phase.end_date ? new Date(phase.end_date) : null;

                    // Check if phase is currently running
                    const isCurrent = start && end && now >= start && now <= end;

                    return (
                      <div key={phase.id} className="flex w-full  flex-col justify-center items-center relative">
                        <div className="w-full">
                          <TooltipProvider>
                            <Tooltip delayDuration={10}>
                              <TooltipTrigger asChild>
                                <Slider
                                disabled={!projectEditPermission}
                                  value={[phaseProgressMap[phase.id] ?? phase.progress ?? 0]}
                                  max={100}
                                  step={1}
                                  className={cn('w-[100%] my-3')}
                                  onValueChange={([val]) => updatePhase(phase.id, val)}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{phaseProgressMap[phase.id] ?? phase.progress ?? 0}%</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <div className="mt-2 text-center">
                            <div className={`text-xs font-medium ${isCurrent ? 'text-clay-600' : 'text-neutral-700'}`}>{phase?.name}</div>
                            <div className={`text-xs ${isCurrent ? 'text-clay-800' : 'text-neutral-500'}`}>
                              {start
                                ? start.toLocaleDateString('en-GB', {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Procurement Radar */}
        <Card className="border animate-in fade-in slide-in-from-bottom-3 duration-600 border-greige-500/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slatex-600" />
                <h3 className="text-sm font-medium text-neutral-900">{t('procurementStatus')}</h3>
              </div>
              <Button
                onClick={() => router.push(`/projects/${params?.id}/procurement`)}
                variant="outline"
                size="sm"
                className="border-greige-500/30 bg-transparent"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {t('openProcurement')}
              </Button>
            </div>
            <div
              className={`${
                projectOverviewData?.procurement_status?.action_required
                  ? 'bg-terracotta-600/10 border-terracotta-600/30'
                  : 'bg-green-600/5 border-green-600/30'
              } border space-y-2 rounded-lg p-4`}
            >
              <div className="flex  items-center   gap-2">
                {projectOverviewData?.procurement_status?.action_required ? (
                  <AlertTriangle className="w-4 h-4 text-terracotta-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-olive-600" />
                )}
                {projectOverviewData?.procurement_status?.action_required ? (
                  <span className="text-sm font-medium text-terracotta-600">Action Required</span>
                ) : (
                  <span className="text-sm font-medium text-olive-600">No Action Required</span>
                )}
              </div>

              {projectOverviewData?.procurement_status?.action_required && (
                <p className="text-sm text-terracotta-600">
                  {projectOverviewData?.pos_delayed?.count > 0 && (
                    <strong>{projectOverviewData?.pos_delayed?.count} items overdue delivery</strong>
                  )}
                  {projectOverviewData?.pos_delayed?.count > 0 &&
                    projectOverviewData?.procurement_status?.pos_needing_approval > 0 &&
                    ` • `}
                  {projectOverviewData?.procurement_status?.pos_needing_approval > 0 &&
                    `${projectOverviewData?.procurement_status?.pos_needing_approval} POs need approval`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Progress & Blockers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Task Progress</h3>
                <span className="text-sm text-neutral-700">{projectOverviewData?.tasks?.completion_percentage ?? 0}% Complete</span>
              </div>

              <Progress value={projectOverviewData?.tasks?.completion_percentage ?? 0} className="[&>div]:bg-clay-500 mb-4" />
            </CardContent>
          </Card>

          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Active Blockers</h3>
                <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30">
                  0 Active
                </span>
              </div>
              <div className="space-y-3">
                {
                  !blockers.map(blocker => (
                    <div key={blocker.id} className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-neutral-900 text-white text-xs font-semibold">{blocker.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{blocker.title}</div>
                          <div className="text-xs text-neutral-600">
                            {blocker.assignee} • {blocker.daysBlocked} days blocked
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                            blocker.priority === 'high'
                              ? 'bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30'
                              : 'bg-ochre-300/20 text-ochre-700 border border-ochre-700/20'
                          }`}
                        >
                          {blocker.priority}
                        </span>
                        <Button size="sm" variant="outline" className="text-xs border-greige-500/30 bg-transparent">
                          Unblock
                        </Button>
                      </div>
                    </div>
                  ))
                }

                <div className="p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">No Active Blocker</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-neutral-900">Recent Activity</h3>
                {/* <Button variant="ghost" size="sm" className="text-xs text-clay-600 hover:text-clay-700">
                  View All
                </Button> */}
              </div>
              <div className="space-y-4">
                {projectOverviewData?.recent_activity?.length > 0 ? (
                  projectOverviewData?.recent_activity?.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-neutral-900 text-white text-xs font-semibold">
                          {activity.name?.substring(0, 2).toUpperCase() || 'TX'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900">
                          <span className="font-medium">{activity.name}</span>
                        </p>
                        <p className="text-xs text-neutral-600">{activity.type}</p>
                        {activity.updated_at && (
                          <p className="text-xs text-neutral-500"> {dayjs(activity.updated_at).format('Do MMMM, YYYY')}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No recent activity.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {can('presentations.view') && (
            <Card className="border border-greige-500/30 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Presentation className="w-5 h-5 text-clay-600" />
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900">Client Presentations</h3>
                    <p className="text-xs text-neutral-500">Create and share concept decks with your client</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/projects/${params?.id}/presentations`)}
                  variant="outline"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Open
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Latest Files</h3>
                <Button
                  onClick={() => router.push(`/projects/${params?.id}/docs`)}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-clay-600 hover:text-clay-700"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Open Docs
                </Button>
              </div>
              <div className="space-y-3">
                {projectOverviewData?.latest_files?.length > 0 ? (
                  projectOverviewData?.latest_files?.slice(0, 5).map((file: any) => (
               <div
  key={file.id}
  className="p-3 bg-white rounded-lg hover:bg-stone-100 cursor-pointer"
  onClick={() => file.url && window.open(file.url, '_blank')}
>
  <div className="flex items-center gap-3 w-full min-w-0">
    <FileText className="w-4 h-4 flex-shrink-0 text-slatex-600" />

    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-neutral-900 truncate">
        {file.name}
      </div>
      <div className="text-xs text-neutral-600 truncate">
        {file.type}
      </div>
    </div>
  </div>
</div>

                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No recent files.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent className="sm:max-w-[600px] rounded-lg">
          <DialogHeader>
            <DialogTitle>{t('uploadCoverTitle')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Area */}
            {file.length > 0 || projectData?.project_banner ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                <Image
                  src={file.length > 0 ? (file[0] as any).preview : projectData?.project_banner}
                  alt="Cover Preview"
                  fill
                  className="object-cover"
                />
                {/* Overlay for replacing */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => document.getElementById('fileInput')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  {file.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleRemoveFile}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Empty State Upload Area
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-stone-50"
              >
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 20MB)</p>
                {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
              </div>
            )}

            <input id="fileInput" type="file" accept="image/*" onChange={handleSelectByClick} className="hidden" />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={UploadCloseModal}>
                Cancel
              </Button>
              <Button onClick={handleFileSubmit} disabled={file.length === 0 || attachmentMutation.isPending}>
                {attachmentMutation.isPending ? 'Uploading...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGuard permission="projects.view" redirectTo="/">
      <ProjectOverviewPageContent params={params} />
    </PermissionGuard>
  );
}
