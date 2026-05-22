'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge, TypeChip } from '@/components/chip';
import {
  Plus,
  Filter,
  User,
  Clock,
  MoreHorizontal,
  Circle,
  CircleDot,
  Eye,
  CheckCircle2,
  FileText,
  Hammer,
  Palette,
  Trash2,
  Search,
  ChevronDown,
} from 'lucide-react';
import { TaskModal } from '@/components/tasks/task-modal';
import type { Task, ListColumn, TeamMember, Phase } from '@/components/tasks/types';
import TimelineView from '@/components/tasks/timeline-view';
import ListView from '@/components/tasks/list-view';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patchData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { DeleteDialog } from '@/components/DeleteDialog';
import useDeleteData from '@/hooks/useDelete';
import useFetch from '@/hooks/useFetch';
import { useNotionTaskSync } from '@/hooks/useNotionTaskSync';
import { CircleFilled } from '@/components/Delete Animation/DeletionAnimations';
import { usePermissions } from '@/hooks/usePermissions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Map priority codes to full names
const getPriorityLabel = (priority: string) => {
  const priorityMap: Record<string, string> = {
    L: 'Low',
    M: 'Medium',
    H: 'High',
  };
  return priorityMap[priority] || priority;
};

const updateTaskListFromPhases = (data: any[], phases: any[]) => {
  if (!Array.isArray(phases)) return [];

  return phases
    .sort((a, b) => a.order - b.order) // keep same order as project
    .map(phase => ({
      id: phase.id,
      name: phase.name, // Phase display name
      items: data?.filter(item => item.phase === phase.id) || [], // match tasks by phase id
      status: phase.name, // you can customize if needed
      icon: null, // you could add an icon mapping if required
      colorClass: phase?.color, // use project color
      startDate: phase?.startDate,
      endDate: phase?.endDate,
    }));
};

const updatetaskList = (data: any[]) => {
  return [
    {
      id: 'initial',
      name: 'Design Concepts',
      items: data?.filter(item => item.phase == 'initial') ?? [],
      status: 'Initial Design Concepts',
      icon: Palette,
      colorClass: '#9333ea', // purple-600
    },
    {
      id: 'design-development',
      name: 'Design Development',
      items: data?.filter(item => item.phase == 'design-development'),
      status: 'Initial Design Concepts',
      icon: CircleDot,
      colorClass: '#d97706', // amber-600
    },
    {
      id: 'technical-drawings',
      name: 'Technical Drawings',
      items: data?.filter(item => item.phase == 'technical-drawings'),
      status: 'Initial Design Concepts',
      icon: FileText,
      colorClass: '#ea580c', // orange-600
    },
    {
      id: 'client-review',
      name: 'Client Review',
      items: data?.filter(item => item.phase == 'client-review'),
      status: 'Initial Design Concepts',
      icon: Eye,
      colorClass: '#e11d48', // rose-600
    },
    {
      id: 'procurement',
      name: 'Procurement',
      items: data?.filter(item => item.phase == 'procurement'),
      status: 'Procurement',
      icon: Circle,
      colorClass: '#059669', // emerald-600
    },
    {
      id: 'site-implementation',
      name: 'Site / Implementation',
      items: data?.filter(item => item.phase == 'site-implementation'),
      status: 'Site / Implementation',
      icon: Hammer,
      colorClass: '#475569', // slate-600
    },
    {
      id: 'complete-project',
      name: 'Complete',
      items: data?.filter(item => item.phase == 'complete-project'),
      status: 'Complete',
      icon: CheckCircle2,
      colorClass: '#4b5563', // gray-600
    },
  ];
};

type UITask = Task & {
  startDate?: string;
  endDate?: string;
  assignees?: string[];
};

const TEAM: TeamMember[] = [
  { id: 'jd', name: 'Jane Designer' },
  { id: 'mj', name: 'Mike Johnson' },
  { id: 'sw', name: 'Sarah Wilson' },
  { id: 'tb', name: 'Tom Builder' },
];

const PHASES: Phase[] = [
  { id: 'phase-concept', name: 'Concept' },
  { id: 'phase-design-dev', name: 'Design Development' },
  { id: 'phase-technical', name: 'Technical Drawings' },
  { id: 'phase-review', name: 'Client Review' },
  { id: 'phase-procurement', name: 'Procurement' },
  { id: 'phase-site', name: 'Site / Implementation' },
];

const LISTS: (ListColumn & { icon: any; colorClass: string; id: string })[] = [
  {
    id: 'concept',
    title: 'Design Concepts',
    icon: Palette,
    colorClass: 'text-purple-600',
  },
  {
    id: 'design-dev',
    title: 'Design Development',
    icon: CircleDot,
    colorClass: 'text-amber-600',
  },
  {
    id: 'technical',
    title: 'Technical Drawings',
    icon: FileText,
    colorClass: 'text-orange-600',
  },
  {
    id: 'review',
    title: 'Client Review',
    icon: Eye,
    colorClass: 'text-rose-600',
  },
  {
    id: 'procurement',
    title: 'Procurement',
    icon: Circle,
    colorClass: 'text-emerald-600',
  },
  {
    id: 'site',
    title: 'Site / Implementation',
    icon: Hammer,
    colorClass: 'text-slate-600',
  },
  {
    id: 'complete',
    title: 'Complete',
    icon: CheckCircle2,
    colorClass: 'text-gray-600',
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function displayDue(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  } catch {
    return '';
  }
}

function ProjectTasksPageContent({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [tasks, setTasks] = React.useState<UITask[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [defaultPhase, setDefaultPhase] = React.useState<string | undefined>(undefined);
  const [editing, setEditing] = React.useState<UITask | null>(null);
  const [activeTab, setActiveTab] = React.useState<'board' | 'list' | 'timeline'>('board');
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const { can } = usePermissions();
  const taskPermission = can('tasks.edit');
  const taskDeletePermission = can('tasks.delete');
  const projectPermission = can('projects.edit');

  useNotionTaskSync(!!projectId);

  const {
    data: taskData,
    isLoading: taskLoading,
    refetch: refetchTasks,
  } = useFetch(projectId ? `task/user-tasks-project?project_id=${projectId}` : null, { enabled: !!projectId });

  const { data: phasesData, isLoading: phasesLoading } = useFetch(projectId ? `projects/project-phases?project_id=${projectId}` : null, {
    enabled: !!projectId,
  });

  const handleModalClose = e => {
    setModalOpen(e);
    setEditing(null);
  };

  const queryClient = useQueryClient();

  const modifyTaskMutation = useMutation({
    mutationFn: (data: any) => patchData({ url: `task/tasks/${data.id}/`, data }),
    onSuccess: () => {
      refetchTasks();
    },
    onError: error => {
      console.error('Error modifying task:', error);
    },
  });

  const { mutate: removeTask } = useDeleteData({
    onSuccess: () => {
      toast.success('Task deleted successfully', {
        duration: 3000,
        dismissible: true,
      });
      setIsDeleteOpen(false);
      refetchTasks();
    },
    onError: (error: any) => {
      toast.error('Error deleting task');
    },
  });

  const openDeleteModal = (task: any) => {
    setIsDeleteOpen(true);
    setSelectedTask(task);
  };

  const handleDeleteTimer = (id: string) => {
    if(!taskDeletePermission) {
      toast.error('You do not have permission to delete this task');
      return;
    }
    setTimeout(() => {
      let secondsLeft = 5;
      let timer: any, updateInterval: any;
      const createToastContent = (seconds: number) => (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <CircleFilled />
            <div>
              <div className="font-sm">Deleting Task...</div>
              <div className="text-xs opacity-70">{seconds}s remaining</div>
            </div>
          </div>
          <button
            onClick={() => {
              clearTimeout(timer);
              clearInterval(updateInterval);
              toast.dismiss(t);
              toast.success('Deletion cancelled');
            }}
            className="px-3 py-1 text-sm bg-black text-white rounded  transition-colors ml-4"
          >
            Cancel
          </button>
        </div>
      );

      const t = toast.warning(createToastContent(secondsLeft), {
        duration: Infinity,
      });

      updateInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
          toast.warning(createToastContent(secondsLeft), {
            id: t,
            duration: Infinity,
          });
        }
      }, 1000);

      timer = setTimeout(() => {
        removeTask({ url: `task/tasks/${id}/` });
        clearInterval(updateInterval);
        toast.dismiss(t);
      }, 5000);
    }, 100);
  };

  const handleDeleteTask = () => {
    if (selectedTask?.id) {
      handleDeleteTimer(selectedTask.id);
      setIsDeleteOpen(false);
    }
  };

  // console.log(phasesData)

  React.useEffect(() => {
    if (taskLoading || phasesLoading) return;

    const rawTasks = Array.isArray(taskData) ? taskData : taskData?.data || [];
    // Map API task structure to UI task structure
    const mappedTasks = rawTasks.map((t: any) => ({
      ...t,
      name: t.title, // Map title to name for UI
      startDate: t.start_date,
      endDate: t.end_date,
      subtasks: t.subtask, // Map subtask (singular) to subtasks (plural) for TaskModal
    }));

    setTasks(mappedTasks);
  }, [taskData, phasesData, taskLoading, phasesLoading]);

  const columns = React.useMemo(() => {
    const rawPhases = Array.isArray(phasesData) ? phasesData : phasesData?.data || [];
    if (rawPhases.length > 0) {
      return updateTaskListFromPhases(tasks || [], rawPhases);
    } else {
      return updatetaskList(tasks || []);
    }
  }, [tasks, phasesData]);

  function openNewTask(phase?: string) {
    // console.log(phase);
    setDefaultPhase(phase);
    setEditing(null);
    setModalOpen(true);
  }

  function openEditTask(task: UITask) {
    setEditing(task);
    setModalOpen(true);
  }

  function handleSave(payload: Omit<Task, 'id'> & { id?: string }) {
    if (payload.id) {
      setTasks(prev => prev.map(t => (t.id === payload.id ? { ...t, ...payload } : t)));
    } else {
      const newTask: UITask = { ...payload, id: crypto.randomUUID() } as UITask;
      setTasks(prev => [newTask, ...prev]);
    }
  }

  function subtaskProgress(t: UITask) {
    const total = t?.subtasks?.length;
    const done = t?.subtasks?.filter(s => s?.is_completed)?.length;
    return { done, total };
  }

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumn: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumn', sourceColumn);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getPhaseName = (phaseId: any) => {
    // console.log(phaseId);
    const phase = phasesData?.data?.find((p: any) => p.id == phaseId);
    return phase ? phase.name : phaseId;
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    // console.log(targetColumn);
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    if (!taskId || !sourceColumn || sourceColumn === targetColumn) return;

    // Show success message after UI update
    toast.success(`Task moved to ${getPhaseName(targetColumn)}`);

    const phase = phasesData?.find((p: any) => p.name === targetColumn).id;

    // Send update to server
    const modifyInfo = {
      phase,
      id: taskId,
    };

    try {
      // Using await to handle errors more cleanly
      await modifyTaskMutation.mutateAsync(modifyInfo);
    } catch (error) {

      toast.error('Failed to update task on server');
    }
  };

  return (
    <div className="">
      <div className=" space-y-6">
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('board')}
              className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'board' ? 'text-white bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              Board
            </button>
            {/* <button
              onClick={() => setActiveTab('list')}
              className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'list' ? 'text-white bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              List
            </button> */}
            <button
              onClick={() => setActiveTab('timeline')}
              className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'timeline' ? 'text-white bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              Timeline
            </button>
          </div>

       {taskPermission && projectPermission &&   <div className="flex items-center gap-3">
    
            <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-md" onClick={() => openNewTask()}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>}
        </div>

        {/* Board View */}
        {activeTab === 'board' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="overflow-x-auto scrollbar-thin scrollbar">
              <div className="flex gap-6 min-w-max pb-2">
                {columns &&
                  columns?.map(col => {
                    return (
                      <div
                        onDragOver={e => handleDragOver(e)}
                        onDrop={e => handleDrop(e, col?.name)}
                        key={col?.name}
                        className="w-80 flex-shrink-0"
                      >
                        <div className="bg-white border border-gray-200 rounded-xl p-4 bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {/* {React.createElement(col?.icon, { className: `w-4 h-4 ${col?.colorClass}` })} */}
                              <span className="font-medium text-gray-900">{col.name}</span>
                              <TypeChip label={String(col?.items?.length)} />
                            </div>
                         {taskPermission && projectPermission &&   <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
                              title="Add task"
                              aria-label="Add task"
                              onClick={() => openNewTask(col?.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>}
                          </div>

                          <div className="space-y-3 mb-4 min-h-[200px]">
                            {col?.items?.map(task => {
                              // console.log(task);
                              const memberInitials =
                                (task?.assignees && task?.assignees.length > 0) || (task?.assignees?.length ?? 0) > 0
                                  ? getInitials(task?.assignees[0]?.name)
                                  : '';
                              const { done, total } = subtaskProgress(task);

                              const canDrag = taskPermission && projectPermission;
                              return (
                                <Tooltip key={task.id} delayDuration={500} open={canDrag ? false : undefined}>
                                  <TooltipTrigger asChild>
                                <div
                                  draggable
                                  onDragStart={e => {
                                    if (!canDrag) {
                                      e.preventDefault();
                                      toast.warning("You do not have permission to perform this action.");
                                      return;
                                    }
                                    handleDragStart(e, task?.id, col?.name);
                                  }}
                                  className={`p-3  active:cursor-grabbing rounded-lg border bg-white hover:shadow-sm transition-all cursor-pointer ${
                                    task.status === 'done' ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => openEditTask(task)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={e => e.key === 'Enter' && openEditTask(task)}
                                >
                                  <div className="flex items-start gap-3 mb-2">
                                    <Checkbox checked={task.status === 'done'} disabled className="mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className={`font-medium truncate text-sm text-gray-900 leading-tight ${
                                          task.status === 'done' ? 'line-through text-gray-400' : ''
                                        }`}
                                      >
                                        {task.name}
                                      </h4>
                                      <div className="mt-2 flex items-center gap-2">
                                        {task.priority && (
                                          <StatusBadge
                                            status={getPriorityLabel(task.priority).toLowerCase()}
                                            label={getPriorityLabel(task.priority)}
                                          />
                                        )}
                                        {total > 0 && (
                                          <span className="text-[11px] text-gray-500">
                                            {done}/{total}
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {displayDue(task.end_date ?? task.start_date)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {memberInitials}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                  {taskDeletePermission && projectPermission &&  <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-6 h-6 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
                                        onClick={e => {
                                          e.stopPropagation();
                                          openDeleteModal(task);
                                        }}
                                        title="Delete"
                                        aria-label="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                        onClick={e => {
                                          e.stopPropagation();
                                          openEditTask(task);
                                        }}
                                        title="More"
                                        aria-label="More"
                                      >
                                        <MoreHorizontal className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>View Only</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}

                            {/* {colTasks.length === 0 && (
                              <div className="text-sm text-gray-500 px-2 py-6 text-center">{'No tasks yet. Add the first task.'}</div>
                            )} */}

                          {taskPermission && projectPermission &&   <Button
                              variant="ghost"
                              className="w-full text-gray-600 hover:text-gray-800 hover:bg-stone-100 justify-center border-2 border-dashed border-gray-200 hover:border-gray-300 py-8"
                              size="sm"
                              onClick={() => openNewTask(col?.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Task
                            </Button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === 'list' && (
          <ListView
            tasks={tasks || []}
            team={TEAM}
            phases={PHASES}
            lists={LISTS}
            onEditTask={openEditTask}
            onCreateTask={e => openNewTask(e)}
          />
        )}

        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <TimelineView
            tasks={tasks || []}
            setTasks={setTasks as any}
            phases={PHASES}
            lists={LISTS}
            team={TEAM}
            onEditTask={openEditTask as any}
            onCreateTask={() => openNewTask(undefined)}
          />
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        projectId={projectId}
        team={TEAM}
        phase={defaultPhase}
        taskToEdit={editing}
        onSave={handleSave}
        refetchTasks={refetchTasks}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        requireConfirmation={false}
      />
    </div>
  );
}

export default function ProjectTasksPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGuard permission="tasks.view" redirectTo="/projects">
      <ProjectTasksPageContent params={params} />
    </PermissionGuard>
  );
}