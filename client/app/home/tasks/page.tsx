'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { HomeNav } from '@/components/home-nav';
import { DataCardsGrid, type DataCardItem } from '@/components/data-cards';
import {
  CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Circle,
  CircleDot,
  Eye,
  Hash,
  Clock,
  CircleX,
  Trash2,
  ChevronDown,
  User,
  FolderOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TypeChip, StatusBadge } from '@/components/chip';
import useFetch from '@/hooks/useFetch';
import { patchData } from '@/lib/Api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useDeleteData from '@/hooks/useDelete';
import { gooeyToast as toast } from 'goey-toast';
import { TaskModal } from '@/components/tasks/task-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/DeleteDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { useNotionTaskSync } from '@/hooks/useNotionTaskSync';
import { usePermissions } from '@/hooks/usePermissions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

type UITask = any; // keep your own type here if you have one

// Map priority codes to full names
const getPriorityLabel = (priority: string, t: ReturnType<typeof useTranslations<'homeTasksPage'>>) => {
  const priorityMap: Record<string, string> = {
    L: t('priority.low'),
    M: t('priority.medium'),
    H: t('priority.high'),
  };
  return priorityMap[priority] || priority;
};

const updatetaskList = (data: any[], t: ReturnType<typeof useTranslations<'homeTasksPage'>>) => {
  return [
    {
      id: 'todo',
      name: t('columns.todo'),
      items: data?.filter(item => item.status == 'todo') ?? [],
      icon: Circle,
      color: 'text-gray-600',
    },
    {
      id: 'in-progress',
      name: t('columns.inProgress'),
      items: data?.filter(item => item.status == 'in-progress') ?? [],
      icon: CircleDot,
      color: 'text-blue-600',
    },
    {
      id: 'in-review',
      name: t('columns.inReview'),
      items: data?.filter(item => item.status == 'in-review') ?? [],
      icon: Eye,
      color: 'text-orange-600',
    },
    {
      id: 'done',
      name: t('columns.done'),
      items: data?.filter(item => item.status == 'done') ?? [],
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ];
};

const AnimatedClock = ({ running = false, className = '' }: { running?: boolean; className?: string }) => {
  return (
    <>
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Clock circle */}
        <circle cx="12" cy="12" r="10" />

        {/* Hour hand */}
        <line x1="12" y1="12" x2="12" y2="7" className={running ? 'hour-hand' : ''} />

        {/* Minute hand */}
        <line x1="12" y1="12" x2="16" y2="12" className={running ? 'minute-hand' : ''} />
      </svg>

      <style jsx>{`
        .hour-hand {
          transform-origin: 12px 12px;
          animation: spinHour 6s linear infinite;
        }

        .minute-hand {
          transform-origin: 12px 12px;
          animation: spinMinute 1s linear infinite;
        }

        @keyframes spinHour {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinMinute {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// Memoized Sortable Task Card to avoid unnecessary re-renders
// compact card to reduce per-item DOM footprint
const SortableTaskCard = React.memo(function SortableTaskCardInner({
  task,
  handleTrackingClick,
  project,
  openEditTask,
  openDeleteModal,
  canEdit,
  canDelete,
  t,
  tc,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    willChange: 'transform',
  } as React.CSSProperties;

  const memberInitials =
    (task?.assignees && task?.assignees.length > 0) || (task?.assignees?.length ?? 0) > 0 ? getInitials(task?.assignees[0]?.name) : '';

  const cardEl = (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canEdit ? listeners : { onPointerDown: () => toast.warning(tc('noPermissionAction')) })}
      className={`p-3 h-[105px] flex flex-col justify-between rounded-lg border bg-white hover:bg-stone-50 transition-all ${
        isDragging ? 'shadow-xl bg-white opacity-50 cursor-grabbing' : canEdit ? 'border-gray-200' : 'border-gray-200 cursor-default'
      }`}
      onClick={() => openEditTask(task)}
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium capitalize text-sm truncate text-gray-900 leading-tight">{task.name}</h4>
          <Button
            onClick={e => handleTrackingClick(e, task.id)}
            variant="ghost"
            size="sm"
            className={`w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2 ${
              task?.time_tracker === 'ON' ? 'bg-black text-white' : ''
            }`}
          >
            {/* <Clock className={` w-3 h-3 `} /> */}
            <AnimatedClock running={task?.time_tracker === 'ON'} />
          </Button>
        </div>

        <div className="text-xs capitalize truncate text-gray-600 mb-2">{(task?.project && task?.project?.project_name) || ''}</div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">
            {task.subtasks.filter((st: any) => st.is_completed).length}/{task.subtasks.length}
          </span>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {memberInitials}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {task?.priority && (
              <StatusBadge status={getPriorityLabel(task?.priority, t).toLowerCase()} label={getPriorityLabel(task?.priority, t)} />
            )}
          </div>
    {canDelete && <div className="flex items-center gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                openDeleteModal(task);
              }}
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>}
        </div>
      </div>
    </div>
  );

  if (!canEdit) {
    return (
      <Tooltip delayDuration={2000}>
        <TooltipTrigger asChild>{cardEl}</TooltipTrigger>
        <TooltipContent side="top">
          <p>{t('viewOnly')}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardEl;
});

// Droppable Column component (memoized)
const DroppableColumn = React.memo(function DroppableColumnInner({
  column,
  project,
  openEditTask,
  handleTrackingClick,
  openDeleteModal,
  openNewTask,
  isDraggingOver,
  getTrackingButtonClass,
  visibleCount,
  onLoadMore,
  can,
  t,
  tc,
}: any) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white  border border-gray-200 rounded-xl p-4 shadow-sm transition-all ${
        isDraggingOver ? '!border-gray-500  !border-1 border-dashed !bg-[#f9f8f6]' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <column.icon className={`w-4 h-4 ${column.color}`} />
          <span className="font-medium text-gray-900">{column.name}</span>
          <TypeChip label={String(column?.items?.length ?? 0)} />
        </div>
        {can("tasks.edit") && <div className="flex items-center gap-1">
          <Button
            onClick={e => {
              e.stopPropagation();
              openNewTask(column.id);
            }}
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>}
      </div>

      {/* Task Cards */}
      <div className="space-y-3  h-full  max-h-[600px] overflow-y-auto scrollbar-hide">
        <SortableContext
          items={(column.items || []).slice(0, visibleCount).map((item: any) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {(column.items || []).slice(0, visibleCount).map((task: any) => (
            <SortableTaskCard
              handleTrackingClick={handleTrackingClick}
              key={task.id}
              task={task}
              project={project}
              openEditTask={openEditTask}
              openDeleteModal={openDeleteModal}
              canEdit={can('tasks.edit')}
              canDelete={can("tasks.delete")}
              getTrackingButtonClass={getTrackingButtonClass}
              t={t}
              tc={tc}
            />
          ))}
        </SortableContext>

        {/* Load more */}
        {visibleCount < (column.items?.length || 0) && (
          <div className="flex items-center mt-1 justify-center">
            <button
              className="w-full text-gray-500 py-2 hover:text-black  flex text-xs justify-center items-center gap-1 font-medium"
              onClick={e => {
                e.stopPropagation();
                onLoadMore(column.id);
              }}
            >
              <span>{t('loadMore')}</span>
              <ChevronDown className="w-4 h-4 " />
            </button>
          </div>
        )}

        {/* Add Task Button */}
        {/* <Button
          data-dndkit-disabled-drag-handle
          onClick={e => {
            e.stopPropagation();
            openNewTask();
          }}
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700 hover:bg-stone-50 justify-center"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button> */}
      </div>
    </div>
  );
});

const mapStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    TD: 'todo',
    IP: 'in-progress',
    IR: 'in-review',
    D: 'done',
  };
  return statusMap[status] || 'todo';
};

const mapTaskData = (data: any[]) => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    ...item,
    id: String(item.id),
    name: item.title,
    projectID: item.project,
    subtasks: item.subtask || [],
    status: mapStatus(item.status),
    priority: item.priority,
    assigned: item.assignees,
    creator: item.created_by,
    dueDate: item.end_date,
  }));
};

export default function MyTasksPage() {
  const t = useTranslations('homeTasksPage');
  const tc = useTranslations('common');

  const [myTask, setMyTask] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [visibleCounts, setVisibleCounts] = React.useState<Record<string, number>>({});
  const [editing, setEditing] = React.useState<UITask | null>(null);
  const { can, isLoading: permLoading } = usePermissions();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState<string | undefined>(undefined);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const router = useRouter();

  const [activeID, setActiveId] = useState<string | null>(null);
  const [overID, setOverId] = useState<string | null>(null);
  const dragStartColumnRef = React.useRef<string | null>(null);
  /** Latest column hovered during drag (state updates lag behind dragEnd). */
  const dragEndColumnRef = React.useRef<string | null>(null);
  const { user } = useUser();
  const queryClient = useQueryClient();

  useNotionTaskSync();

  const { data: taskData, isLoading: taskLoading } = useFetch('task/user-tasks/');
  const { data: taskDataCards, isLoading: taskDataCardsLoading } = useFetch('task/task-datacards/');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const openNewTask = React.useCallback((status?: string) => {
    setDefaultStatus(status);
    setEditing(null);
    setModalOpen(true);
  }, []);

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<null | 'today' | 'overdue' | 'archive'>(null);

  const openEditTask = React.useCallback((task: any) => {
    setEditing(task);
    setModalOpen(true);
  }, []);

  // Initialize visible counts per column when tasks change
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    setVisibleCounts(prev => {
      const next: Record<string, number> = { ...prev };
      tasks.forEach((col: any) => {
        if (typeof next[col.id] === 'undefined') next[col.id] = 10;
      });
      return next;
    });
  }, [tasks]);

  const handleLoadMore = React.useCallback(
    (columnId: string) => {
      setVisibleCounts(prev => {
        const current = prev[columnId] || 10;
        const col = tasks.find((c: any) => c.id === columnId);
        const total = col?.items?.length || 0;
        const nextCount = Math.min(current + 10, total);
        return { ...prev, [columnId]: nextCount };
      });
    },
    [tasks],
  );

  const handleClose = (e: boolean) => {
    setModalOpen(e);
    setEditing(null);
    setDefaultStatus(undefined);
  };

  function handleSave(_payload: Omit<any, 'id'> & { id?: string }) {
    // handled elsewhere (DB-driven)
  }

  const { mutateAsync: updateTaskStatus, error: deleteError } = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      patchData({ url: `task/tasks/${id}/move/`, data: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['task/task-datacards/'], refetchType: 'active' });
    },
    onError: () => {
      toast.error(t('toasts.statusUpdateFailed'));
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'], refetchType: 'active' });
    },
  });

  // Handle Task button click
  const handleTrackingClick = (e: React.MouseEvent, taskId: string | number) => {
    e.stopPropagation();

    router.push(`/home/time`);
    return;
  };

  const showArchiveTask = tasks => {
    if (!tasks) return;
    const tempTask = tasks.filter(item => item.isArchived);
    return tempTask;
  };

  useEffect(() => {
    if (taskLoading) return;
    const mappedData = mapTaskData(taskData);
    let list = myTaskList(mappedData);
    setMyTask(list);

    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter(t => t.name?.toLowerCase().includes(s));
    }
    if (filter === 'today') list = todayTasks(list);
    else if (filter === 'overdue') list = myRecentTask(list);
    else if (filter === 'archive') {
      list = showArchiveTask(list);
    }

    const removedArhive = list.filter(item => !item.isArchived);

    // setTasks(mappedData && mappedData.length > 0 ? updatetaskList(filter === 'archive' ? list : removedArhive) : []);
    setTasks(updatetaskList(filter === 'archive' ? list : removedArhive, t));
  }, [taskData, taskLoading, user?.email, searchText, filter, t]);



 

  const myTaskList = (arr: any[]) => {
    if (!arr) return [];
    if (!user) return [];
    let filtered = arr;
    return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  };


  const dataCards: DataCardItem[] = [
    {
      title: t('cards.totalTasks'),
      value: taskDataCards?.total_task_count,
      subtitle: t('cards.totalTasksSubtitle'),
      icon: Hash,
    },
    {
      title: t('cards.overdueTasks'),
      value: taskDataCards?.overdue_task_count,
      subtitle: t('cards.overdueSubtitle'),
      icon: AlertTriangle,
    },
    {
      title: t('cards.addedToday'),
      value: taskDataCards?.task_added_today_count,
      subtitle: t('cards.addedTodaySubtitle'),
      icon: CalendarIcon,
    },
    {
      title: t('cards.activeProjects'),
      value: taskDataCards?.active_projects_count,
      subtitle: t('cards.activeProjectsSubtitle'),
      icon: FolderOpen,
    },
  ];

  const findContainer = React.useCallback(
    (id: string) => {
      const normalized = String(id);
      if (tasks.some(col => col.id === normalized)) {
        return normalized;
      }
      const column = tasks.find(col =>
        col.items?.some((item: any) => String(item.id) === normalized)
      );
      return column?.id ?? null;
    },
    [tasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    setActiveId(activeId);
    dragStartColumnRef.current = findContainer(activeId);
    dragEndColumnRef.current = dragStartColumnRef.current;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    setOverId(overContainer);
    if (overContainer) {
      dragEndColumnRef.current = overContainer;
    }

    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return;

    setTasks(prev => {
      const prevClone = prev.map(col => ({ ...col, items: [...col.items] }));

      const activeCol = prevClone.find(col => col.id === activeContainer);
      const overCol = prevClone.find(col => col.id === overContainer);
      if (!activeCol || !overCol) return prev;

      const activeIndex = activeCol.items.findIndex(item => String(item.id) === activeId);
      const overIndex = overCol.items.findIndex(item => String(item.id) === overId);
      if (activeIndex === -1) return prev;

      const activeItem = activeCol.items[activeIndex];
      // remove from activeCol immutably
      activeCol.items = activeCol.items.filter((_, idx) => idx !== activeIndex);

      const updatedItem = { ...activeItem, status: overContainer };

      if (overIndex === -1) {
        overCol.items = [...overCol.items, updatedItem];
      } else {
        overCol.items = [...overCol.items.slice(0, overIndex), updatedItem, ...overCol.items.slice(overIndex)];
      }

      return prevClone;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const startColumn = dragStartColumnRef.current;
    const endColumnFromDrag = dragEndColumnRef.current;
    dragStartColumnRef.current = null;
    dragEndColumnRef.current = null;
    setActiveId(null);
    setOverId(null);

    const activeId = String(event.active.id);
    if (!startColumn) return;

    // Refs are updated synchronously in dragOver; React `tasks` may still be stale here
    let endColumn = endColumnFromDrag;
    if (!endColumn && event.over) {
      endColumn = findContainer(String(event.over.id));
    }
    if (!endColumn) {
      endColumn = findContainer(activeId);
    }
    if (!endColumn || startColumn === endColumn) {
      return;
    }

    const statusMapReverse: Record<string, string> = {
      todo: 'TD',
      'in-progress': 'IP',
      'in-review': 'IR',
      done: 'D',
    };

    const apiStatus = statusMapReverse[endColumn] || 'TD';

    try {
      await updateTaskStatus({ id: activeId, status: apiStatus });
      const columnLabels: Record<string, string> = {
        done: t('columns.done'),
        'in-review': t('columns.inReview'),
        todo: t('columns.todo'),
        'in-progress': t('columns.inProgress'),
      };
      toast.success(t('toasts.taskMoved', { column: columnLabels[endColumn] ?? endColumn }));
    } catch {
      toast.error(t('toasts.statusUpdateFailed'));
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'], refetchType: 'active' });
    }
  };

  useEffect(() => {
    document.title = t('documentTitle');
  }, [t]);

  const { mutate: removeTask, isPending: isDeleting } = useDeleteData({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      toast.success(t('toasts.taskDeleted'), {
        duration: 1000,
        dismissible: true,
      });
      setIsDeleteOpen(false);
    },
    onError: (error: any) => {
      toast.error(t('toasts.deleteFailed'));
    },
  });

  const openDeleteModal = (task: any) => {
    setIsDeleteOpen(true);
    setSelectedTask(task);
  };

  const handleDelete = (id: string) => {
    removeTask({ url: `task/tasks/${id}/` });
  };

  // if (!isClient) return null; // Prevent SSR hydration errors

  // Get the active task for drag overlay
  const activeTask = activeID
    ? tasks.find(col => col.items.some(item => item.id === activeID))?.items.find(item => item.id === activeID)
    : null;

  // console.log(activeTask)

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className=" w-full flex flex-col flex-1 min-h-0 space-y-6">
        {/* <HomeNav /> */}
        <DataCardsGrid items={dataCards} />

        {/* Toolbar */}
        <div className="flex  animate-in fade-in slide-in-from-bottom-3 duration-400  items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger className='hidden' asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-white h-9">
                  <Filter className="w-4 h-4" />
                  {t('filter')}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center" className="w-40">
                <DropdownMenuItem onClick={() => setFilter('archive')}>{t('archive')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('overdue')}>{t('overdue')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('today')}>{t('addedToday')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {filter && (
              <Button size={'sm'} variant={'secondary'} className=" capitalize">
                {filter}
                <span onClick={() => setFilter(null)} className="ml-2 inline-flex">
                  <CircleX className="h-4 w-4" />
                </span>
              </Button>
            )}

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-10 h-9" placeholder={t('searchPlaceholder')} />
            </div>
          </div>

        {can("tasks.edit") &&  <div className="flex items-center gap-2">
            <Button onClick={() => openNewTask()} size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4" />
              {t('addTask')}
            </Button>
          </div>}
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid animate-in fade-in slide-in-from-bottom-3 duration-500 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {!taskLoading && tasks?.every((col: any) => col.items?.length === 0) ? (
              <div className="col-span-full bg-white border border-gray-200 rounded-xl p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('emptyTitle')}</h3>
                <p className="text-gray-500 max-w-sm mb-8">
                  {t('emptyDescription')}
                </p>
             {can("tasks.edit") &&   <Button
                  onClick={() => openNewTask()}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 rounded-lg text-base font-medium transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t('createFirstTask')}
                </Button>}
              </div>
            ) : (
              tasks?.map((column: any) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  openEditTask={openEditTask}
                  openDeleteModal={openDeleteModal}
                  openNewTask={openNewTask}
                  isDraggingOver={overID === column.id}
                  handleTrackingClick={handleTrackingClick}
                  visibleCount={visibleCounts[column.id] || 10}
                  onLoadMore={handleLoadMore}
                  can={can}
                  t={t}
                  tc={tc}
                />
              ))
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="p-3 h-[105px] cursor-grabbing flex flex-col justify-between rounded-lg border bg-white shadow-xl border-gray-200 rotate-3">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium capitalize text-sm truncate text-gray-900 leading-tight">{activeTask.name}</h4>
                    <Button variant="ghost" size="sm" className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>

                 <div className="text-xs capitalize truncate text-gray-600 mb-2">{(activeTask?.project && activeTask?.project?.project_name) || ''}</div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500">
                      {activeTask?.subtasks?.filter((subtask: any) => subtask.selected === true).length}/{activeTask?.subtasks?.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      {activeTask?.priority && (
                        <StatusBadge
                          status={getPriorityLabel(activeTask?.priority, t).toLowerCase()}
                          label={getPriorityLabel(activeTask?.priority, t)}
                        />
                      )}
                    </div>
                     <div className="flex items-center gap-1">
            <button
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={handleClose}
        projectId={null}
        team={null}
        taskToEdit={editing}
        onSave={handleSave}
        setEditing={setEditing}
        openDeleteModal={openDeleteModal}
        status={defaultStatus}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDelete(selectedTask?.id)}
        title={t('deleteTaskTitle')}
        description={t('deleteTaskDescription')}
        itemName={selectedTask?.name}
        requireConfirmation={false}
      />
    </div>
  );
}
