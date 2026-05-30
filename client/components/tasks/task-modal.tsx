'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CalendarIcon,
  Check,
  TagIcon,
  Users,
  GitBranch,
  Flag,
  Paperclip,
  ListTodo,
  GripVertical,
  Trash2,
  Folder,
  CircleDot,
  TypeIcon,
  Plus,
  Search,
  X,
  Smile,
  ImageIcon,
  Clock3,
  Palette,
  FileText,
  Eye,
  Circle,
  Hammer,
  CheckCircle2,
  ArchiveRestore,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TypeChip } from '@/components/chip';
import type { ListColumn, Phase, TeamMember, Task, Subtask, Priority, Status, Attachment } from '@/components/tasks/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { patchData, deleteData, postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import DraggableSubtasks2 from './DraggableSubtasks2';
import { AnimatePresence, motion } from 'framer-motion';
import Attachments, { uploadTaskFiles } from './Attachments';
import useUser from '@/hooks/useUser';
import useDeleteData from '@/hooks/useDelete';
import { useTaskModalStore } from '@/store/useTaskModalStore';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useEditGuard } from '@/hooks/useEditGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { TaskComments } from '@/components/tasks/TaskComments';
import { useTranslations } from 'next-intl';

const PhaseSelect = React.memo(function PhaseSelect({
  projectId,
  selectedPhase,
  onSelect,
}: {
  projectId: string | number;
  selectedPhase: string | number | null | undefined;
  onSelect: (value: { id: string | number; name: string } | null) => void;
}) {
  const t = useTranslations('taskModal');
  type PhaseItem = { id: string | number; name: string };
  const pid = String(projectId);
  const phasesUrl = pid ? `projects/project-phases/?project_id=${pid}` : null;
  const { data: phases = [], isLoading, error, refetch } = useFetch(phasesUrl, {
    enabled: !!pid,
  });
  const [seeding, setSeeding] = useState(false);
  const seedAttempted = useRef(false);
  const autoSelected = useRef(false);

  const phaseList: PhaseItem[] = Array.isArray(phases) ? phases : [];

  useEffect(() => {
    seedAttempted.current = false;
    autoSelected.current = false;
  }, [pid]);

  useEffect(() => {
    if (!pid || isLoading || error || phaseList.length > 0 || seedAttempted.current) return;
    seedAttempted.current = true;
    setSeeding(true);
    postData({
      url: `projects/project-phases/seed-defaults/?project_id=${pid}`,
      data: {},
    })
      .then((res: { phases?: PhaseItem[] }) => {
        refetch();
        const first = res?.phases?.[0];
        if (first && selectedPhase == null && !autoSelected.current) {
          autoSelected.current = true;
          onSelect(first);
        }
      })
      .catch(() => {
        seedAttempted.current = false;
      })
      .finally(() => setSeeding(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onSelect is unstable; auto-select runs once per project
  }, [pid, isLoading, error, phaseList.length, refetch, selectedPhase]);

  if (isLoading || seeding) {
    return <div className="text-sm text-gray-500">{t('loadingPhases')}</div>;
  }
  if (error) {
    return <div className="text-sm text-red-500">{t('phasesLoadFailed')}</div>;
  }

  if (phaseList.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500">{t('noPhases')}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={seeding}
          onClick={async () => {
            setSeeding(true);
            try {
              const res = (await postData({
                url: `projects/project-phases/seed-defaults/?project_id=${pid}`,
                data: {},
              })) as { phases?: PhaseItem[] };
              await refetch();
              const first = res?.phases?.[0];
              if (first) onSelect(first);
              toast.success(t('toasts.defaultPhasesAdded'));
            } catch {
              toast.error(t('toasts.phasesAddFailed'));
            } finally {
              setSeeding(false);
            }
          }}
        >
          {t('addDefaultPhases')}
        </Button>
      </div>
    );
  }

  const selectedPhaseValue = selectedPhase != null ? String(selectedPhase) : undefined;

  return (
    <Select
      value={selectedPhaseValue}
      onValueChange={(val) => {
        const selected = phaseList.find((p) => String(p.id) === val);
        onSelect(selected ?? null);
      }}
    >
      <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
        <SelectValue placeholder={t('selectPhase')}>
          {(() => {
            if (selectedPhase == null) return t('selectPhase');
            const selected = phaseList.find((p) => String(p.id) === String(selectedPhase));
            return selected?.name || t('selectPhase');
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white z-[99]">
        {phaseList.map((phase: PhaseItem) => (
          <SelectItem key={phase.id} value={String(phase.id)}>
            {phase.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

const ProjectSelect = React.memo(function ProjectSelect({
  projects,
  selectedProjectId,
  onSelect,
}: {
  projects: any[];
  selectedProjectId: string | number | null | undefined;
  onSelect: (project: any) => void;
}) {
  const t = useTranslations('taskModal');
  const tHome = useTranslations('homeTasksPage');
  const [open, setOpen] = React.useState(false);

  const selectedProject = React.useMemo(() => {
    if (!selectedProjectId || !projects) return null;
    return projects.find((p: any) => String(p.id) === String(selectedProjectId));
  }, [selectedProjectId, projects]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white h-9 text-sm rounded-xl"
        >
          <span className="flex items-center gap-2 overflow-hidden">
            {selectedProject ? (
              <span className="truncate">{selectedProject.project_name}</span>
            ) : (
              <span className="flex items-center gap-2 text-gray-500">
                <Search className="h-4 w-4" />
                {t('searchProjects')}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md overflow-hidden" align="start">
        <Command className="max-h-[400px]">
          <CommandInput
            placeholder={t('searchProjects')}
            className="focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
          />
          <CommandEmpty>{tHome('noProjectsFound')}</CommandEmpty>
          <CommandList
            className="max-h-[300px] overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandGroup>
              {projects?.map((project: any) => {
                const isSelected = String(project.id) === String(selectedProjectId);
                return (
                  <CommandItem
                    key={project.id}
                    value={project.project_name}
                    onSelect={() => {
                      onSelect(project);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Folder className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{project.project_name}</span>
                    {isSelected && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const initialTask: Task = {
  name: '',
  tag: '',
  progress: 0,
  dueDate: '',
  subtasks: [],
  attachments: [],
  priority: 'L',
  description: '',
  status: 'TD',
  assignee: '',
  phase: null,
  projectID: '',
  comments: [],
  assigned: [],
  startTime: 0,
  endTime: 0,
  isActive: false,
  isPaused: false,
  totalWorkTime: 0,
  note: '',
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId?: string | null;
  projectName?: string;
  lists?: ListColumn[];
  phases?: Phase[];
  team?: TeamMember[] | null;
  defaultListId?: string;
  phase?: string | number | null;
  taskToEdit?: (Omit<Task, 'assigneeIds'> & { assignees?: string[] }) | null;
  onSave?: (payload: Omit<Task, 'id'> & { id?: string }) => void;
  status?: string;
  refetchTasks?: () => void;
  setEditing?: (task: any) => void;
  openDeleteModal?: (task: any) => void;
};

const SHORT_STATUSES = ['TD', 'IP', 'IR', 'D'];

const toShortStatus = (status?: string) => {
  if (!status) return status;

  // already short → return as-is
  if (SHORT_STATUSES.includes(status)) {
    return status;
  }

  const map: Record<string, string> = {
    'todo': 'TD',
    'in-progress': 'IP',
    'in-review': 'IR',
    'done': 'D',
  };

  return map[status] ?? status;
};


export function TaskModal({ open, onOpenChange, projectId, projectName, team, phase, taskToEdit, onSave, status, refetchTasks }: Props) {
  const t = useTranslations('taskModal');
  const tCommon = useTranslations('common');
  const tHome = useTranslations('homeTasksPage');

  // Zustand store
  const taskValues = useTaskModalStore((state) => state.taskValues);
  const setTaskValues = useTaskModalStore((state) => state.setTaskValues);
  const comment = useTaskModalStore((state) => state.comment);
  const setComment = useTaskModalStore((state) => state.setComment);
  const teamMembers = useTaskModalStore((state) => state.teamMembers);
  const setTeamMembers = useTaskModalStore((state) => state.setTeamMembers);
  const selectedMembers = useTaskModalStore((state) => state.selectedMembers);
  const setSelectedMembers = useTaskModalStore((state) => state.setSelectedMembers);
  const filteredUsers = useTaskModalStore((state) => state.filteredUsers);
  const setFilteredUsers = useTaskModalStore((state) => state.setFilteredUsers);
  const showDropdown = useTaskModalStore((state) => state.showMentionDropdown);
  const setShowDropdown = useTaskModalStore((state) => state.setShowMentionDropdown);

  const queryClient = useQueryClient();
  // Users Dropdown
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const [subTaskText, setSubTaskText] = React.useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [pendingAttachmentFiles, setPendingAttachmentFiles] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const pendingAttachmentsRef = React.useRef<File[]>([]);
  const { user, isLoading: userLoading } = useUser();
  const { can } = usePermissions();
  const canEdit = can('tasks.edit');
  const canDelete = can('tasks.delete');
  const { guard: editGuard } = useEditGuard('tasks.edit');

  // Fetch projects using useFetch
  const { data: projectsData = [], isLoading: projectLoading } = useFetch('projects/projects/');

  // Fetch users using useFetch
  const { data: usersData, isLoading: usersLoading } = useFetch(
    user?.studio?.id ? `user/studio-users/?studio_id=${user.studio.id}` : null
  );
  // Mention dropdown
  const mentionRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  // set if a user mention another user in comment
  const [mention, setMention] = React.useState(null);
  const [notification, setNotification] = React.useState(null);

  // set if a user mention another user in subTask
  const [mentionSub, setMentionSub] = React.useState([]);
  const [subNotification, setSubNotification] = React.useState(null);
  const [file, setFile] = React.useState(null);

  // Single useEffect to handle both edit and create scenarios
  React.useEffect(() => {
    if (!open) return;

    if (taskToEdit) {
      // Editing existing task - use taskToEdit data
      setTaskValues(prevValues => ({
        ...prevValues,
        ...taskToEdit,
        subtasks: taskToEdit.subtasks?.map((st: any) => ({
          id: st.id,
          subtask: st.subtask,
          is_completed: st.is_completed || false,
          order: st.order,
          isOffline: false,
        })) || [],
        assigned: taskToEdit.assignees,
        projectID: taskToEdit.project?.id,
        startDate: taskToEdit.start_date,
        dueDate: taskToEdit.end_date,
      }));
    } else {
      // Creating new task - use props (projectId, phase, status)
      setTaskValues(prev => ({
        ...initialTask,
        ...(projectId ? { projectID: projectId } : {}),
        phase: phase !== undefined ? phase : null,
        status: status ? status : 'TD',
      }));
    }
  }, [taskToEdit, open, projectId, phase, status, setTaskValues]);


  React.useEffect(() => {
    pendingAttachmentsRef.current = pendingAttachmentFiles;
  }, [pendingAttachmentFiles]);

  const handleCloseModal = React.useCallback(() => {
    onOpenChange(false);
    setTaskValues(initialTask);
    setComment({ name: '', value: '', time: '', profileImg: '' });
    setSelectedMembers([]);
    setPendingAttachmentFiles([]);
    setIsSubmitting(false);
  }, [onOpenChange, setTaskValues, setComment, setSelectedMembers]);
  

 
  // Subtask mutations
  const { mutate: createSubtask } = usePost({
    onSuccess: (data: any) => {
      toast.success(t('toasts.subtaskCreated'));
     
      
      // 1. Update task's subtask array with the new subtask ID
      if (taskValues.id) {
        const currentSubtaskIds = taskValues.subtasks
          .filter((st: any) => !st.isOffline && st.id) // Only include existing subtasks with real IDs
          .map((st: any) => st.id);
        
        updateTask({
          id: taskValues.id,
          subtask: [...currentSubtaskIds, data.id], // Add the new subtask ID
        });
      }
      
      // 2. Update local state - replace first offline subtask with server data
      setTaskValues(prev => {
        let replaced = false;
        const updatedSubtasks = prev.subtasks.map((st: any) => {
          // Replace the first offline subtask with the server response
          if (!replaced && st.isOffline) {
            replaced = true;
            return {
              id: data.id,
              subtask: data.subtask,
              is_completed: data.is_completed || false,
              order: data.order,
              isOffline: false,
            };
          }
          return st;
        });

        return {
          ...prev,
          subtasks: updatedSubtasks,
        };
      });

      // Refetch tasks to get updated data from server
      queryClient.refetchQueries({
        queryKey: ['task/user-tasks/']
      });
    },

    onError: () => {
      toast.error(t('toasts.subtaskCreateFailed'));
    }
  });


  const { mutate: updateSubtask } = useMutation({
    mutationFn: (data: any) => patchData({ url: `task/subtasks/${data.id}/`, data }),
    onSuccess: () => {
      toast.success(t('toasts.subtaskUpdated'));
      queryClient.refetchQueries({
        queryKey: ['task/user-tasks/']
      });
    },
    onError: () => {
      toast.error(t('toasts.subtaskUpdateFailed'));
    },
  });

  const { mutate: deleteSubtask } = useDeleteData({
    onSuccess: () => {
      toast.success(t('toasts.subtaskDeleted'));
      // queryClient.refetchQueries({ queryKey: ['task/subtasks/'] });
      queryClient.refetchQueries({
        queryKey: ['task/user-tasks/']
      });
    },
    onError: () => {
      toast.error(t('toasts.subtaskDeleteFailed'));
    },
  });

  const { mutate: deleteTask } = useDeleteData({
    onSuccess: () => {
      toast.success(t('toasts.taskDeleted'));
      queryClient.refetchQueries({ queryKey: [`task/user-tasks-project?project_id=${projectId}`] });
      queryClient.refetchQueries({ queryKey: ['task/user-tasks/'] });
      queryClient.refetchQueries({ queryKey: ['task/task-datacards/'] });
      handleCloseModal();
    },
    onError: () => {
      toast.error(t('toasts.taskDeleteFailed'));
    },
  });

  const handleDeleteTask = React.useCallback(() => {
    if (taskValues?.id) {
      deleteTask({ url: `task/tasks/${taskValues.id}/` });
    }
  }, [taskValues?.id, deleteTask]);


  // Create task mutation
  const { mutate: createTask } = usePost({
    onSuccess: async (data: any) => {
      const pending = pendingAttachmentsRef.current;
      if (pending.length && data?.id) {
        try {
          await uploadTaskFiles(data.id, pending);
          setPendingAttachmentFiles([]);
        } catch {
          toast.error(t('toasts.taskCreatedAttachmentsFailed'));
        }
      }
      toast.success(t('toasts.taskCreated'));
      queryClient.refetchQueries({ queryKey: ['task/user-tasks/'] });
      queryClient.refetchQueries({ queryKey: [`task/user-tasks-project?project_id=${projectId}`] });
      queryClient.refetchQueries({ queryKey: [`task/task-datacards/`] });
      handleCloseModal();
      setIsSubmitting(false);
    },
    onError: () => {
      toast.error(t('toasts.taskCreateFailed'));
      setIsSubmitting(false);
    },
  });

  // Update task mutation
  const { mutate: updateTask } = useMutation({
    mutationFn: (data: any) => patchData({ url: `task/tasks/${data.id}/`, data }),
    onSuccess: () => {
      toast.success(t('toasts.taskUpdated'));
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      queryClient.invalidateQueries({ queryKey: [`task/user-tasks-project?project_id=${projectId}`] });
      queryClient.invalidateQueries({ queryKey: [`task/task-datacards/`] });
    },
    onError: () => {
      toast.error(t('toasts.taskUpdateFailed'));
    },
  });

  // Handle archive
  const handleArchive = React.useCallback((state: string) => {
    if (taskValues?.id) {
      updateTask({
        id: taskValues.id,
        state: state, // Archived state
      });
      setTaskValues(prev => ({
        ...prev,
        isArchived: true,
      }));
      toast.success(t('toasts.archived'));
      handleCloseModal();
    }
  }, [taskValues?.id, updateTask, setTaskValues, handleCloseModal]);

  const handleUnArchive = React.useCallback((state: string) => {
    if (taskValues?.id) {
      updateTask({
        id: taskValues.id,
        state: state, // Active state
      });
      setTaskValues(prev => ({
        ...prev,
        isArchived: false,
      }));
      toast.success(t('toasts.restored'));
      handleCloseModal();
    }
  }, [taskValues?.id, updateTask, setTaskValues, handleCloseModal]);

  // Form refs and touched state
  const [touched, setTouched] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);

  // Validation state
  const [errors, setErrors] = React.useState<{
    name?: string;
    phase?: string;
    dates?: string;
  }>({});

  // Clear errors when modal closes
  React.useEffect(() => {
    if (!open) {
      setErrors({});
      setTouched(false);
    }
  }, [open]);

  // Validate form
  const validateForm = React.useCallback(() => {
    const newErrors: typeof errors = {};

    // Task name is required
    if (!taskValues?.name?.trim()) {
      newErrors.name = t('validation.nameRequired');
    } else if (taskValues.name.trim().length > 60) {
      newErrors.name = t('validation.nameMaxLength');
    }

    // If project is selected, phase is required
    if (taskValues?.projectID && !taskValues?.phase) {
      newErrors.phase = t('validation.phaseRequired');
    }

    // If both dates are provided, start date must be before end date
    if (taskValues?.startDate && taskValues?.dueDate) {
      const startDate = new Date(taskValues.startDate);
      const endDate = new Date(taskValues.dueDate);
      if (startDate > endDate) {
        newErrors.dates = t('validation.startBeforeEnd');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [taskValues?.name, taskValues?.projectID, taskValues?.phase, taskValues?.startDate, taskValues?.dueDate, t]);

  // Task submit
  const handleSubmit = React.useCallback(() => {
    setTouched(true);

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    // Construct payload for API
    const payload = {
      title: taskValues.name,
      status: toShortStatus(taskValues.status),
      priority: taskValues.priority,
      start_date: taskValues.startDate || null,
      end_date: taskValues.dueDate || null,
      description: taskValues.description || '',
      state: taskValues.isArchived ? 'ARC' : 'AC',
      project: taskValues.projectID ? Number(taskValues.projectID) : null,
      phase: taskValues.phase?.id || taskValues.phase || null,
      studio: user?.studio?.id || null,
      created_by: user?.id || null,
      updated_by: user?.id || null,
      assignees: (() => {
        // Map existing assigned users to IDs
        const existingIds = taskValues.assigned?.map((a: any) => {
          if (typeof a === 'number') return a;
          if (typeof a === 'object' && a?.id) return a.id;
          return null;
        }).filter((id: any) => id !== null) || [];

        // Add current user as default and merge with existing, removing duplicates
        const allIds = user?.id ? [user.id, ...existingIds] : existingIds;
        return [...new Set(allIds)]; // Remove duplicates using Set
      })(),
      subtask: taskValues.subtasks?.map((st: any) => st.id),
    };
    // Create or update task
    setIsSubmitting(true);

    if (taskToEdit || taskValues?.id) {
      updateTask(
        { ...payload, id: taskValues.id },
        {
          onSuccess: () => {
            handleCloseModal();
            setIsSubmitting(false);
          },
          onError: () => setIsSubmitting(false),
        }
      );
    } else {
      createTask({ url: 'task/tasks/', data: payload });
    }
  }, [taskValues, user, taskToEdit, updateTask, createTask, validateForm, handleCloseModal]);

  // Handle Click Save
  const handleClickSave = React.useCallback(editGuard(() => {
    handleSubmit();
  }), [editGuard, handleSubmit]);

  const handleCommentSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent full page reload

    if (!comment.value.trim()) return; // ignore empty comments

    const newComment = {
      ...comment,
      time: new Date().toLocaleString(),
      name: user?.name || t('anonymous'),
      profileImg: user?.profile_picture || '',
    };

    // Update notifications if mention exists
    if (mention) {
      const notification = {
        id: Date.now(),
        link: '/my-task',
        type: 'comment',
        itemID: taskValues?.id || taskValues?.id,
        title: taskValues?.name,
        isRead: false,
        message: newComment.value,
        timestamp: Date.now(),
        creator: user,
      };
      setNotification(notification);
    }

    // Update local task state
    setTaskValues(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));

    // Send mutation to server
    if (taskValues?.id) {
      updateTask({
        id: taskValues.id,
        comments: [...(taskValues?.comments || []), newComment],
      });
    }

    // Clear input
    setComment({ value: '', name: '', time: '', profileImg: '' });
  }, [comment, user, mention, taskValues?.id, taskValues?.comments, taskValues?.name, setTaskValues, updateTask, setComment]);

  // Handle changes in the textarea

  const handleCommentChanges = React.useCallback((e) => {
    const { value } = e.target;
    setComment(prev => ({ ...prev, value: value }));
    if (value.includes('@')) {
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
      if (lastAtSymbolIndex !== -1) {
        const searchText = textBeforeCursor.slice(lastAtSymbolIndex + 1);
        const filtered = teamMembers.filter(user => user.name.toLowerCase().includes(searchText.toLowerCase()));
        setFilteredUsers(filtered);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  }, [teamMembers, setComment, setFilteredUsers, setShowDropdown]);

  // Handle selecting a user from the dropdown
  const handleSelectUser = React.useCallback((user) => {
    const { value } = comment;
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.slice(0, lastAtSymbolIndex) + `@${user.name}` + textAfterCursor;
    setComment(prev => ({ ...prev, value: newText }));
    setShowDropdown(false);
    textareaRef.current.focus();
    const newCursorPosition = lastAtSymbolIndex + user.name.length + 1;
    textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    setMention(user);
  }, [comment, setComment, setShowDropdown]);


  // Set users from DB

  React.useEffect(() => {
    if (usersLoading) return;
    setTeamMembers(usersData || []);
    setFilteredUsers(usersData || []);
  }, [usersLoading, usersData, setTeamMembers, setFilteredUsers]);

  const handleUpdateTask = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskValues(prevTask => {
      const newValues = {
        ...prevTask,
        [name]: value,
      };
      return newValues;
    });
  }, [setTaskValues]);

  // Submit Task after enter name (only for existing tasks)
  const handleSubmitOnBlur = React.useCallback(() => {
    if (!taskValues?.name || taskValues.name.length < 1) {
      return; // Don't show error on blur, just return
    }
    // Only update if task already exists
    if (taskValues?.id && taskToEdit) {
      updateTask({
        id: taskValues.id,
        title: taskValues?.name,
      });
    }
  }, [taskValues?.name, taskValues?.id, taskToEdit, updateTask]);

  // Cmd/Ctrl + Enter to save
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, []);

  const toggleAssignee = React.useCallback((member: any) => {
    setSelectedMembers(
      prev =>
        prev.some((m: any) => m.id === member.id)
          ? prev.filter((m: any) => m.id !== member.id) // remove
          : [...prev, member] // add
    );
    setTaskValues(prev => {
      const alreadyAssigned = prev.assigned.some((a: any) => a.id === member.id);

      return {
        ...prev,
        assigned: alreadyAssigned
          ? prev.assigned.filter((a: any) => a.id !== member.id) // remove
          : [...prev.assigned, member], // add object
      };
    });
  }, [setSelectedMembers, setTaskValues]);

  // Label rail (160px) with small icon + label
  const Labeled = React.memo(
    ({
      icon,
      label,
      children,
      alignTop = false,
    }: {
      icon: React.ReactNode;
      label: string;
      children: React.ReactNode;
      alignTop?: boolean;
    }) => {
      return (
        <div className="grid grid-cols-[130px_1fr] gap-4 items-center">
          <div className={cn('flex items-center gap-2 text-[13px] text-gray-600', alignTop && 'self-start pt-1')}>
            <span className="text-gray-500">{icon}</span>
            <span className="truncate">{label}</span>
          </div>
          <div>{children}</div>
        </div>
      );
    }
  );

  function initialsOf(name: string): string {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);

    if (parts.length > 1) {
      // Take first char of first and last word
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    // Only one word -> take first 2 letters
    return name.substring(0, 2).toUpperCase();
  }

  function AssigneesMultiSelect({ users }) {
    const [openPop, setOpenPop] = React.useState(false);
    // Convert assigned (which can be IDs or objects) to user objects
    const selected = React.useMemo(() => {
      if (!taskValues?.assigned || !users) return [];
      return taskValues.assigned
        .map((a: any) => {
          // If it's already an object with id, return it
          if (typeof a === 'object' && a.id) return a;
          // If it's an ID, find the user object
          if (typeof a === 'number') return users.find((u: any) => u.id === a);
          return null;
        })
        .filter(Boolean);
    }, [taskValues?.assigned, users]);

    // console.log(taskValues?.assigned, selected);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Popover open={openPop} onOpenChange={setOpenPop}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openPop}
                className="w-full justify-between bg-white h-9 text-sm rounded-xl"
              >
                <span className="flex items-center gap-2 overflow-hidden">
                  {selected?.length > 0 ? (
                    <>
                      <div className="flex -space-x-2">
                        {selected.slice(0, 4).map((m: any) => (
                          <Avatar key={m.id} className="h-6 w-6 ring-2 ring-white">
                            {/* @ts-ignore optional avatarUrl */}
                            <AvatarImage src={(m as any).photoURL || ''} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="truncate text-sm text-gray-600">
                        {selected.length} selected
                        {selected.length > 4 ? ' +' + (selected.length - 4) : ''}
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-500">
                      <Search className="h-4 w-4" />
                      {t('searchTeammates')}
                    </span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md overflow-hidden" align="start">
              <Command className="max-h-[400px]">
                <CommandInput
                  placeholder={t('searchTeammates')}
                  className=" focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
                />
                <CommandEmpty>{tHome('noMembers')}</CommandEmpty>
                <CommandList 
                  className="max-h-[300px] overflow-y-auto" 
                  style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                  onWheel={(e) => e.stopPropagation()}
                >
                  <CommandGroup className="[&_[cmdk-group]]:overflow-visible">
                    {users?.map(m => {
                      // Handle both cases: assigned can be array of IDs or array of objects
                      const checked = taskValues?.assigned?.some((a: any) =>
                        typeof a === 'number' ? a === m.id : a.id === m.id
                      );
                      return (
                        <CommandItem key={m.id} value={m.name} className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleAssignee(m)}
                            className="focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.photoURL || ''} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{m.name}</span>
                          {checked && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selected?.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setTaskValues(prev => ({
                  ...prev,
                  assigned: [],
                }))
              }
            >
              Clear
            </Button>
          )}
        </div>

        {
          taskValues?.assigned?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected?.map(m => (
                <span onClick={() => toggleAssignee(m)}>
                  <TypeChip key={m.id} label={m.name} className="cursor-pointer" />
                </span>
              ))}
            </div>
          )
        }
      </div >
    );
  }


  // handle Task Save
  const handleSave = React.useCallback((e) => {
    e.preventDefault();
    handleClickSave();
  }, [handleClickSave]);

  return (
    <Sheet open={open} onOpenChange={e => handleCloseModal(e)}>
      {/* Single rounded grey surface with balanced padding (28px top/side) */}
      <SheetContent
        onOpenAutoFocus={e => e.preventDefault()}
        side="right"
        className="v0-task-sheet w-full sm:max-w-[700px] md:max-w-[720px] h-full px-8 md:px-9 pt-10 md:pt-10 pb-0 bg-stone-50  shadow-xl flex flex-col overflow-hidden"
      >
       <div className='flex items-center justify-end'>
         {canEdit && taskValues?.state === 'ARC' && (
          <Button type="button"
            variant="ghost"
            onClick={() => handleUnArchive('AC')}
            className="h-8 px-2 text-gray-500 hover:text-gray-600 hover:bg-stone-50 gap-2"
          >
            <ArchiveRestore size={17} />
            Unarchive
          </Button>
        )}
        {canEdit && taskValues?.state !== 'ARC' && taskValues?.id && (
          <Button type="button"
            variant="ghost"
            onClick={() => handleArchive('ARC')}
            className="h-8 px-2 text-gray-500 hover:text-gray-600 hover:bg-stone-50 gap-2"
          >
            <Archive size={17} />
            {tCommon('deleteDialog.archive')}
          </Button>
        )}
        {canDelete && taskValues?.id && (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 size={17} />
            {tCommon('delete')}
          </Button>
        )}
       </div>

        <form
          ref={formRef}
          onSubmit={e => handleSave(e)}
          onKeyDown={handleKeyDown}
          className="flex-1 pt-5 overflow-auto thin-scrollbar pr-2 overscroll-contain pb-20"
          aria-label={t('taskFormAria')}
        >
          {/* Title row */}
          <div className="pb-6">
            <div className="grid grid-cols-[130px_1fr] gap-4 items-center">
              <div className="flex  items-center gap-2 text-[13px] text-gray-600">
                <TypeIcon className="h-4 w-4 text-gray-500" />
                <span>{tCommon('name')}</span>
              </div>
              <div className="space-y-1">
                <Input
                  type="text"
                  name="name"
                  value={taskValues.name}
                  onChange={handleUpdateTask}
                  onBlur={() => handleSubmitOnBlur()}
                  autoFocus={false}
                  placeholder={t('addTaskName')}
                  className={cn(
                    'bg-white h-10 text-[16px] md:text-[17px] font-medium rounded-xl',
                    errors.name && touched && 'border-red-300 focus-visible:ring-red-200'
                  )}
                  aria-invalid={!!errors.name && touched}
                />
                {errors.name && touched && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* project select */}
            <Labeled icon={<Folder className="h-4 w-4" />} label={t('project')}>
              <ProjectSelect
                projects={projectId ? projectsData?.filter((item: any) => item.id == projectId) : projectsData}
                selectedProjectId={taskValues?.projectID || projectId}
                onSelect={(project: any) => {
                  const e = {
                    target: {
                      name: 'projectID',
                      value: project?.id ? Number(project.id) : null,
                    },
                  } as any;
                  handleUpdateTask(e);
                  // Clear phase when project changes
                  if (project?.id !== taskValues?.projectID) {
                    setTaskValues(prev => ({ ...prev, phase: null }));
                  }
                }}
              />
            </Labeled>

            {/* phase select */}
            <AnimatePresence mode="popLayout">
              {taskValues?.projectID && (
                <motion.div
                  key="phase-select"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Labeled icon={<GitBranch className="h-4 w-4" />} label={t('phase')}>
                    {/* Fetch phases for the selected project */}
                    {taskValues?.projectID && (
                      <div className="space-y-1">
                        <PhaseSelect
                          projectId={taskValues.projectID}
                          selectedPhase={taskValues?.phase}
                          onSelect={(value: any) => {
                            // Store only the phase ID, not the full object
                            setTaskValues(prev => ({ ...prev, phase: value?.id || value }))
                          }}
                        />
                        {errors.phase && touched && (
                          <p className="text-xs text-red-500">{errors.phase}</p>
                        )}
                      </div>
                    )}
                  </Labeled>
                </motion.div>
              )}
            </AnimatePresence>

            {/* status select */}
            <Labeled icon={<CircleDot className="h-4 w-4" />} label={t('status')}>
              <Select
                value={toShortStatus(taskValues?.status || '')}
                onValueChange={value => {
                  const e = {
                    target: {
                      name: 'status',
                      value: value,
                    },
                  } as any;
                  handleUpdateTask(e);
                }}
              >
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TD">{t('statuses.todo')}</SelectItem>
                  <SelectItem value="IP">{t('statuses.inProgress')}</SelectItem>
                  <SelectItem value="IR">{t('statuses.inReview')}</SelectItem>
                  <SelectItem value="D">{t('statuses.done')}</SelectItem>
                </SelectContent>
              </Select>
            </Labeled>

            {/* priority select */}
            <Labeled icon={<Flag className="h-4 w-4" />} label={t('priority')}>
              <Select
                value={taskValues?.priority || ''}
                onValueChange={value => {
                  const e = {
                    target: {
                      name: 'priority',
                      value: value,
                    },
                  } as any;
                  handleUpdateTask(e);
                }}
              >
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder={t('selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">{tHome('priority.low')}</SelectItem>
                  <SelectItem value="M">{tHome('priority.medium')}</SelectItem>
                  <SelectItem value="H">{tHome('priority.high')}</SelectItem>
                </SelectContent>
              </Select>
            </Labeled>

            {/* start date */}
            <Labeled icon={<CalendarIcon className="h-4 w-4" />} label={t('startDate')}>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                        !taskValues?.startDate && 'text-muted-foreground',
                        errors.dates && touched && 'border-red-300'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {taskValues?.startDate ? format(toDateFromYMD(taskValues?.startDate), 'PPP') : t('pickStartDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                    <Calendar
                      mode="single"
                      selected={taskValues?.startDate ? toDateFromYMD(taskValues?.startDate) : null}
                      onSelect={d =>
                        setTaskValues(prev => ({
                          ...prev,
                          startDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                        }))
                      }
                      initialFocus
                    // setStartDate(d ? format(d, 'yyyy-MM-dd') : undefined)
                    />
                  </PopoverContent>
                </Popover>
                {taskValues?.startDate && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setTaskValues(prev => ({ ...prev, startDate: null }))}>
                    Clear
                  </Button>
                )}
              </div>
            </Labeled>


            <Labeled icon={<CalendarIcon className="h-4 w-4" />} label={t('dueDate')}>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                          !taskValues?.dueDate && 'text-muted-foreground',
                          errors.dates && touched && 'border-red-300'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {taskValues?.dueDate ? format(toDateFromYMD(taskValues?.dueDate), 'PPP') : t('pickDueDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                      <Calendar
                        mode="single"
                        selected={taskValues?.dueDate ? toDateFromYMD(taskValues?.dueDate) : undefined}
                        onSelect={d =>
                          setTaskValues(prev => ({
                            ...prev,
                            dueDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {taskValues?.dueDate && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setTaskValues(prev => ({ ...prev, dueDate: null }))}>
                      Clear
                    </Button>
                  )}
                </div>
                {errors.dates && touched && (
                  <p className="text-xs text-red-500">{errors.dates}</p>
                )}
                {/* <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="1"
                    value={typeof estimateHours === 'number' ? String(estimateHours) : ''}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '') setEstimateHours(undefined);
                      else {
                        const n = Number(v);
                        setEstimateHours(Number.isNaN(n) ? undefined : Math.max(1, Math.floor(n)));
                      }
                    }}
                    className="bg-white h-9 text-sm rounded-xl"
                    aria-label="Duration (days)"
                  />
                  <span className="text-xs text-gray-500">Duration (days)</span>
                </div> */}
              </div>
            </Labeled>

            {/* <Labeled icon={<TagIcon className="h-4 w-4" />} label="Tags">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a tag and press Enter (e.g., Kitchen)"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTagFromInput();
                      }
                    }}
                    className="bg-white h-9 text-sm rounded-xl"
                  />
                  <Button type="button" variant="outline" onClick={addTagFromInput} className="bg-white h-9 rounded-xl">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <TypeChip
                        key={t}
                        label={
                          <span className="inline-flex items-center gap-1">
                            <span>{t}</span>
                            <button
                              type="button"
                              className="ml-0.5 rounded hover:bg-stone-100"
                              onClick={() => removeTag(t)}
                              aria-label={`Remove ${t}`}
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </Labeled> */}

            {/* assignees */}
            <Labeled icon={<Users className="h-4 w-4" />} label={t('assignees')}>
              <AssigneesMultiSelect
                users={React.useMemo(() => {
                  const projectAssigneeIds = projectsData?.find((item: any) => item.id == taskValues?.projectID)?.assignees || [];
                  // Filter usersData to get user objects whose IDs are in the project's assignees array
                  return usersData?.filter((user: any) => projectAssigneeIds.includes(user.id)) || [];
                }, [projectsData, taskValues?.projectID, usersData])}
              />
            </Labeled>

            {/* description */}
            <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
              <div className="flex items-center gap-2 text-[13px] text-gray-600 self-start pt-1">
                <span className="text-gray-500">
                  <TypeIcon className="h-4 w-4" />
                </span>
                <span className="truncate">{tCommon('summary')}</span>
              </div>
              <div>
                <Textarea
                  placeholder={t('descriptionPlaceholder')}
                  id="description"
                  name="description"
                  rows={5}
                  value={taskValues?.description || ''}
                  onChange={e => {
                    setTaskValues(prev => ({
                      ...prev,
                      description: e.target.value,
                    }));
                  }}
                  className="min-h-[104px] bg-white text-sm rounded-xl"
                />
              </div>
            </div>

            {/* attachments */}
            <Attachments
              taskId={taskValues?.id ?? taskToEdit?.id}
              pendingFiles={pendingAttachmentFiles}
              onPendingFilesChange={setPendingAttachmentFiles}
            />

            {/* sub tasks */}
            <Labeled icon={<ListTodo className="h-4 w-4" />} label={t('subTasks')} alignTop>
              <DraggableSubtasks2
                member={teamMembers}
                taskId={taskValues?.id}
                subtasks={taskValues?.subtasks}
                setTaskValues={setTaskValues}
                setMentionSub={setMentionSub}
                teamMembers={teamMembers}
                createSubtask={createSubtask}
                updateSubtask={updateSubtask}
                deleteSubtask={deleteSubtask}
                studioId={user?.studio?.id}
                userId={user?.id}
                canEdit={canEdit}
              />
            </Labeled>

            {taskValues?.id && (
              <TaskComments
                taskId={taskValues.id}
                projectId={String(taskValues.projectID || projectId || '')}
                teamMembers={teamMembers.map(m => ({ id: Number(m.id), name: m.name }))}
              />
            )}
          </div>

          {/* Comments & Activity with rounded segmented tabs */}
          { false && <div className="mt-6">
            <Separator className="mb-3" />
            <Tabs defaultValue="comments" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="bg-stone-200/60 rounded-full p-1 h-10">
                  <TabsTrigger
                    value="comments"
                    className="rounded-full h-8 px-4 text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Comments
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="rounded-full h-8 px-4 text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="mt-4">
                <div className="rounded-2xl border border-gray-200 bg-white">
                  <form className="border relative rounded-xl py-3 px-4">
                    <Textarea
                      name="value"
                      ref={textareaRef}
                      value={comment.value}
                      onChange={handleCommentChanges}
                      required
                      placeholder="Add Comment (@mention to notify)"
                      className="border-none bg-white outline-none focus:ring-0 focus:shadow-none"
                    />

                    {showDropdown && (
                      <div
                        ref={mentionRef}
                        className="absolute w-[300px] max-h-[230px] overflow-auto bg-white z-[9999] top-[20%] left-[40%] border border-gray-200 shadow-lg rounded-lg mt-2"
                      >
                        <ul>
                          {filteredUsers.map(user => (
                            <li
                              key={user.id}
                              className="py-2 text-sm px-4 hover:bg-stone-100 cursor-pointer"
                              onClick={() => handleSelectUser(user)}
                            >
                              {user.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <button onClick={handleCommentSubmit} type="button" className="py-2 mt-3 px-4 bg-[#17181B] rounded-lg text-white">
                        Comment
                      </button>

                      <div className="flex items-center gap-1">{/* Your additional buttons/icons here */}</div>
                    </div>
                  </form>
                </div>

                {taskValues?.comments?.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {taskValues?.comments?.map(c => (
                      <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={c?.profileImg || ''} />
                            <AvatarFallback className="text-[10px]">{initialsOf(c?.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-gray-900">{c?.name}</span>
                              <span className="text-xs text-gray-500">{c?.time}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{c?.value}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ul className="space-y-3">
                  {/* {activity.length === 0 ? (
                    <li className="text-sm text-gray-500">No activity yet.</li>
                  ) : (
                    activity.map(a => (
                      <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3 text-sm">
                        <Clock3 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-800">{a.text}</span>
                        <span className="ml-auto text-xs text-gray-500">{format(a.createdAt, 'PP p')}</span>
                      </li>
                    ))
                  )} */}
                </ul>
              </TabsContent>
            </Tabs>
          </div>}
        </form>

        {/* Sticky footer dock with aligned actions */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-stone-50">
          <div className="h-16 px-7 md:px-7 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" className="h-10" onClick={handleCloseModal}>
              {tCommon('cancel')}
            </Button>
            {canEdit && (
              <Button
                type="button"
                className="h-10 bg-gray-900 text-white hover:bg-gray-800"
                disabled={isSubmitting}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {isSubmitting ? tCommon('saving') : tCommon('save')}
                <span className="ml-2 text-xs opacity-70">{'⌘⏎'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Scoped styles: neutral focus ring, rounded overlays, subtle scrollbar, close button inset */}
        <style jsx global>{`
          .v0-task-sheet > button[aria-label='Close'] {
            top: 22px !important;
            right: 18px !important;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .v0-task-sheet .thin-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
          }

          /* Neutral ring and no browser blue outlines within the sheet only */
          .v0-task-sheet {
            --ring: 0 0% 65%;
          }
          .v0-task-sheet :is(input, textarea, select, button, [role='combobox'], .cmdk-input):focus {
            outline: none !important;
          }
          .v0-task-sheet .cmdk-input:focus-visible {
            box-shadow: 0 0 0 2px hsl(0 0% 85%) !important;
            border-radius: 0.75rem;
          }

          /* Neutralize blue text selection inside the task sheet */
          .v0-task-sheet ::selection {
            background-color: hsl(0 0% 84%); /* light neutral gray */
            color: hsl(222 47% 11%); /* near-black text */
          }
          /* Ensure inputs and textareas follow the same selection color */
          .v0-task-sheet input::selection,
          .v0-task-sheet textarea::selection {
            background-color: hsl(0 0% 84%);
            color: hsl(222 47% 11%);
          }
        `}</style>
      </SheetContent>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          handleDeleteTask();
          setIsDeleteDialogOpen(false);
        }}
        title={t('deleteTaskTitle')}
        description={t('deleteTaskDescription')}
        itemName={taskValues?.name}
        requireConfirmation={false}
        confirmText={tCommon('delete')}
      />
    </Sheet>
  );
}

function toDateFromYMD(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
