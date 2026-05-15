'use client';

import type React from 'react';

import { Input } from '@/components/ui/input';
import { BreadcrumbBar } from '@/components/breadcrumb-bar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AlertCircle, Play, Pause, Square, Plus, Search, Command, Clock, X, ExternalLink, ClipboardCheck, Calendar, Sparkles, Package, ChevronDown, User, LogOut } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from '@/components/ui/label';
import { gooeyToast as toast } from 'goey-toast';
import { useQueryClient } from '@tanstack/react-query';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command as CommandPrimitive, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, Folder } from 'lucide-react';
import useUser from '@/hooks/useUser';
import { TaskModal } from './tasks/task-modal';
import NotificationButton from './ui/Notification';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import { useGmailSearchStore } from '@/store/useGmailSearchStore';
import { usePermissions } from '@/hooks/usePermissions';
import { CommandPalette } from '@/components/command-palette';

// ── Project Select with Command search ──────────────────────────────────────
function ProjectSelectSearch({
  projects,
  selectedProjectId,
  onSelect,
}: {
  projects: any[];
  selectedProjectId: string | number | null | undefined;
  onSelect: (projectId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedProject = projects?.find((p: any) => String(p.id) === String(selectedProjectId));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white h-8 text-sm"
        >
          <span className="flex w-full items-center gap-2 overflow-hidden">
            {selectedProject ? (
              <span className="truncate">{selectedProject.project_name}</span>
            ) : (
              <span className="flex justify-between w-full items-center gap-2 text-gray-800 text-sm font-normal">

                <span>Select Project</span>

                 <ChevronDown color='#979aa1' className="h-3.5 w-3.5" />
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[280px] rounded-xl border border-gray-200 shadow-md overflow-hidden z-[9999]"
        align="start"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <CommandPrimitive className="max-h-[300px]">
          <CommandInput
            placeholder="Search projects…"
            className="focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none text-sm"
          />
          <CommandEmpty>No projects found</CommandEmpty>
          <CommandList
            className="max-h-[200px] overflow-y-auto"
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
                      onSelect(String(project.id));
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Folder className="h-3.5 w-3.5 text-gray-500" />
                    <span className="truncate">{project.project_name}</span>
                    {isSelected && <Check className="ml-auto h-3.5 w-3.5 text-gray-500" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}

// ── Task Select with Command search ──────────────────────────────────────────
function TaskSelectSearch({
  tasks,
  selectedTask,
  onSelect,
}: {
  tasks: any[];
  selectedTask: any;
  onSelect: (task: any) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedTaskObj = tasks?.find((t: any) => String(t.id) === String(selectedTask?.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white h-8 text-sm"
        >
          <span className="flex w-full items-center gap-2 overflow-hidden">
            {selectedTaskObj ? (
              <span className="truncate">{selectedTaskObj.title}</span>
            ) : (
              <span className="flex justify-between w-full items-center gap-2 text-gray-800 text-sm font-normal">
                <span>Select Task</span>
                <ChevronDown color='#979aa1' className="h-3.5 w-3.5" />
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[280px] rounded-xl border border-gray-200 shadow-md overflow-hidden z-[9999]"
        align="start"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <CommandPrimitive className="max-h-[300px]">
          <CommandInput
            placeholder="Search tasks…"
            className="focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none text-sm"
          />
          <CommandEmpty>No tasks available</CommandEmpty>
          <CommandList
            className="max-h-[200px] overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandGroup>
              {tasks?.map((task: any) => {
                const isSelected = String(task.id) === String(selectedTask?.id);
                return (
                  <CommandItem
                    key={task.id}
                    value={task.title}
                    onSelect={() => {
                      onSelect(task);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5 text-gray-500" />
                    <span className="truncate">{task.title}</span>
                    {isSelected && <Check className="ml-auto h-3.5 w-3.5 text-gray-500" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}

// ── Elapsed time helpers ────────────────────────────────────────────────────
function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function useElapsedTimer(startedAt: string | null | undefined) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}

export function TopBar() {
  // ── Command palette state ──────────────────────────────────────────────
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // ── Timer popup state ──────────────────────────────────────────────────
  const [timerPopupOpen, setTimerPopupOpen] = useState(false);

  // ── Gmail search state ─────────────────────────────────────────────────
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery, clearSearch } = useGmailSearchStore();
  const [localSearch, setLocalSearch] = useState('');
  const isInboxPage = pathname === '/ai/inbox' || pathname === '/home/inbox';
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { can, isLoading: permLoading } = usePermissions();

  // Sync local search with store when on inbox page
  useEffect(() => {
    if (isInboxPage) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery, isInboxPage]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce search query update (500ms)
    if (isInboxPage) {
      debounceTimerRef.current = setTimeout(() => {
        setSearchQuery(value);
      }, 500);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && localSearch.trim()) {
      // Clear debounce and immediately trigger search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setSearchQuery(localSearch);
      if (!isInboxPage) {
        router.push('/ai/inbox');
      }
    }
    if (e.key === 'Escape') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setLocalSearch('');
      clearSearch();
    }
  };

  // ── Form state (start-tracking) ────────────────────────────────────────
  const [studioTask, setStudioTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [note, setNote] = useState('');
  const { user } = useUser();
  const [filteredTask, setFilteredTask] = useState<any[]>([]);
  const [task, setTask] = useState<any>(null);
  
  // ── Quick-add task modal ────────────────────────────────────────────────
  const [TaskmodalOpen, setTaskmodalOpen] = useState(false);

  // ── Meeting modal state ────────────────────────────────────────────────
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState<Date | undefined>(undefined);
  const [meetingEndTime, setMeetingEndTime] = useState<Date | undefined>(undefined);
  const [meetingAttendees, setMeetingAttendees] = useState('');

  // ── API hooks ───────────────────────────────────────────────────────────
  const { data: activeTask, isLoading: activeTaskLoading } = useFetch('time_tracker/timelogs/active/');

  const normalizedTask = useMemo(() => {
    if (!activeTask) return null;
    if (typeof activeTask === 'object' && !Array.isArray(activeTask)) return activeTask;
    return null;
  }, [activeTask]);

  const elapsed = useElapsedTimer(normalizedTask?.start_time);

  const queryClient = useQueryClient();

  const {
    data: projectData,
    isLoading,
  } = useFetch('projects/projects/');

  const mutation = usePost({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['time_tracker/user-time-logs/'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/timelogs/active/'] });
      toast('Timer Started');
      resetForm();
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  const stopMutation = usePost({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['time_tracker/timelogs/active/'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/user-time-logs/'] });
      toast('Timer Stopped');
    },
    onError: () => {
      toast('Error stopping timer');
    },
  });

  const resetForm = useCallback(() => {
    setSelectedProject('');
    setFilteredTask([]);
    setNote('');
    setSelectedTask(null);
  }, []);

  // ── Project / Task data loading ─────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    setProjects(projectData);
  }, [isLoading, projectData]);

  const { data: taskData, isLoading: taskLoading } = useFetch('task/tasks/');

  useEffect(() => {
    const filtered = task?.filter(item => String(item.project) === String(selectedProject)) || [];
    setFilteredTask(filtered);
  }, [selectedProject, task]);

  useEffect(() => {
    if (taskLoading) return;
    if (taskData && Array.isArray(taskData)) setTask(taskData);
  }, [taskLoading, taskData]);


  // ── Handlers ────────────────────────────────────────────────────────────
  const handleStartTracking = useCallback(() => {
    if (!selectedTask && !studioTask) {
      toast.error('Select Project and Task');
      return;
    }
    const payload = {
      project: selectedTask?.project || null,
      task: selectedTask?.id || null,
      description: note,
      studio: user?.studio?.id || null,
    };
    mutation.mutate({ url: 'time_tracker/clock-in/', data: payload });
  }, [selectedTask, mutation, note, user?.studio?.id, studioTask]);

  const handleStopTimer = useCallback(() => {
    if (!normalizedTask) return;
    stopMutation.mutate({ url: 'time_tracker/clock-out/', data: {} });
  }, [normalizedTask, stopMutation]);

  const dropdownOpenTaskModal = useCallback(() => {
    setTaskmodalOpen(true);
  }, []);

  const handleClose = (e: boolean) => {
    setTaskmodalOpen(e);
  };

  // ── Meeting mutation ───────────────────────────────────────────────────
  const meetingMutation = usePost({
    onSuccess: () => {
      toast.success('Event created successfully!');
      setMeetingModalOpen(false);
      setMeetingSummary('');
      setMeetingLocation('');
      setMeetingDescription('');
      setMeetingStartTime(undefined);
      setMeetingEndTime(undefined);
      setMeetingAttendees('');
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to create event.';
      toast.error(errMsg);
    },
  });

  const handleMeetingSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingSummary || !meetingStartTime || !meetingEndTime) {
      toast.warning('Summary, Start Time, and End Time are required.');
      return;
    }
    const attendeesList = meetingAttendees.split(',').map(a => a.trim()).filter(a => a);
    const payload = {
      summary: meetingSummary,
      location: meetingLocation,
      description: meetingDescription,
      start_time: meetingStartTime.toISOString(),
      end_time: meetingEndTime.toISOString(),
      attendees: attendeesList,
    };
    meetingMutation.mutate({ url: 'gmail/calendar/create-event/', data: payload });
  }, [meetingSummary, meetingLocation, meetingDescription, meetingStartTime, meetingEndTime, meetingAttendees, meetingMutation]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <header className="h-14 bg-white gap-3 flex items-center justify-between px-4 lg:px-6 border-b border-gray-200">
      <div className="flex items-center gap-6 flex-1">
        <div className="lg:block hidden"><BreadcrumbBar /></div>

        <div className="flex-1 max-w-md lg:mx-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  className="relative w-full flex items-center h-9 px-3 gap-2 rounded-md border border-input bg-white text-sm text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="flex-1 text-left text-gray-400 text-sm">Search or ask AI...</span>
                  <kbd className="hidden sm:flex items-center gap-0.5 text-[11px] font-mono text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                    <Command className="w-2.5 h-2.5" />K
                  </kbd>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex py-2 items-center gap-1">
                Open Search
                <kbd className="flex items-center gap-0.5 font-mono text-[11px] bg-white/20 border border-white/30 px-[3px] py-1 rounded">
                  <Command className="w-2.5 h-2.5" />
                </kbd>
                <kbd className="font-mono text-[11px] bg-white/20 border border-white/30 px-1 py-[1px] rounded">
                  K
                </kbd>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex gap-3 mr-0 lg:mr-6">
        <TooltipProvider>
          {/* Notification bell */}
          <Tooltip>
            <TooltipTrigger asChild>
              <NotificationButton />
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          {/* Timer button + popover */}
          <Popover open={timerPopupOpen} onOpenChange={setTimerPopupOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    className="bg-stone-50 hover:bg-stone-100 text-ink focus-visible:ring-neutral-300 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2"
                    aria-label="Time Tracker"
                  >
                    <Clock className="w-4 h-4 stroke-[1.75]" />
                    {!activeTaskLoading && normalizedTask && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Time Tracker</p>
              </TooltipContent>
            </Tooltip>

            <PopoverContent
              className="w-[320px] p-0 rounded-xl border border-gray-200 shadow-lg"
              align="end"
              sideOffset={8}
            >
              {/* Popup header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold text-gray-900">Time Tracker</span>
                <button
                  onClick={() => setTimerPopupOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Timer display */}
              <div className="px-4 pt-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {normalizedTask && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span className="text-2xl font-mono font-semibold text-gray-900">
                      
                      {formatElapsed(normalizedTask ? elapsed : 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {normalizedTask
                      ? normalizedTask.project_name || normalizedTask.description || 'Tracking…'
                      : 'No project selected'}
                  </p>
                </div>
              </div>

              {/* Body: conditional on active timer */}
              <div className="px-4 py-4">
                {normalizedTask ? (
                  /* Active timer — pause / stop controls */
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-sm"
                      onClick={() => {
                        toast('Pause coming soon');
                      }}
                    >
                      <Pause className="w-4 h-4" /> Pause
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={handleStopTimer}
                    >
                      <Square className="w-4 h-4" /> Stop
                    </Button>
                  </div>
                ) : (
                  /* No active timer — project/task/note form + start */
                  <div className="space-y-3">
                    <div className="flex items-center justify-end">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className={`w-4 h-4 ${studioTask ? 'text-black' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${studioTask ? 'text-black' : 'text-gray-600'}`}>Studio task</span>
                        <Switch className="scale-90" checked={studioTask} onCheckedChange={setStudioTask} />
                      </div>
                    </div>

                    {!studioTask && (
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Project</Label>
                        <ProjectSelectSearch
                          projects={projects || []}
                          selectedProjectId={selectedProject}
                          onSelect={(projectId) => setSelectedProject(projectId)}
                        />
                      </div>
                    )}

                    {!studioTask && (
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Task</Label>
                        <TaskSelectSearch
                          tasks={filteredTask}
                          selectedTask={selectedTask}
                          onSelect={(task) => setSelectedTask(task)}
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Note</Label>
                      <Input
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="h-8 text-sm bg-white"
                        placeholder="What are you working on?"
                      />
                    </div>

                    <Button type="button" onClick={handleStartTracking} className="w-full gap-2 text-sm">
                      <Play className="w-4 h-4" /> Start Tracking
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t px-4 py-2.5">
                <Link
                  href="/settings/user/time-tracking"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                  onClick={() => setTimerPopupOpen(false)}
                >
                  View all time entries
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Add dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="bg-primary hover:opacity-90 text-primary-foreground focus-visible:ring-neutral-300 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2"
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Add</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-xl" align="end">
            {can("tasks.edit") &&    
              <DropdownMenuItem onClick={dropdownOpenTaskModal} className="flex items-center gap-2 hover:bg-stone-50 focus:bg-stone-50">
                <ClipboardCheck className="w-4 h-4" /> Task
              </DropdownMenuItem>}
              <DropdownMenuItem onClick={() => setMeetingModalOpen(true)} className="flex items-center gap-2 hover:bg-stone-50 focus:bg-stone-50">
                <Calendar className="w-4 h-4" /> Meeting
              </DropdownMenuItem>
              {/* <DropdownMenuItem className="flex items-center gap-2 hover:bg-stone-50 focus:bg-stone-50">
                <Sparkles className="w-4 h-4" /> AI Note
              </DropdownMenuItem> */}
          {can("finance.edit") &&    <DropdownMenuItem className="flex items-center gap-2 hover:bg-stone-50 focus:bg-stone-50">
                <Link className='flex items-center gap-1.5' href={'/finance/invoices/new'}>
                <Package className="w-4 h-4" /> Create Invoice
                </Link>
              </DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User avatar */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="bg-stone-50 hover:bg-stone-100 focus-visible:ring-neutral-300 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2">
                    <Avatar className="h-7 w-7 rounded-md">
                      <AvatarImage src={user?.profile_picture} alt={user?.name} />
                      <AvatarFallback className="rounded-md bg-stone-200 text-gray-600 font-medium text-xs">
                        {user?.name && user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Account</p></TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="min-w-56 bg-white rounded-lg shadow-xl" align="end" sideOffset={8}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.profile_picture} alt={user?.name} />
                    <AvatarFallback className="rounded-lg font-bold text-sm">
                      {user?.name && user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-gray-500">{user?.email || 'Loading..'}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => window.location.href = '/settings/user/profile'} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/settings/user/time-tracking'} className="cursor-pointer">
                  <Clock className="w-4 h-4 mr-2" /> Time Tracking
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => { try { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout/`, { method: 'POST', credentials: 'include' }); } catch {} window.location.href = '/login'; }} className="text-red-600 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>

      {/* Command palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Quick-add task modal */}
      <TaskModal
        open={TaskmodalOpen}
        onOpenChange={handleClose}
        projectId={null}
        team={null}
        taskToEdit={null}
        onSave={null}
        setEditing={null}
        status={null}
      />

      {/* Meeting dialog */}
      <Dialog open={meetingModalOpen} onOpenChange={setMeetingModalOpen}>
        <DialogContent className="sm:max-w-[550px] !overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Create a new event on your Google Calendar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMeetingSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="meeting-summary">Summary <span className="text-red-500">*</span></Label>
              <Input
                id="meeting-summary"
                value={meetingSummary}
                onChange={(e) => setMeetingSummary(e.target.value)}
                placeholder="Meeting with Client"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting-location">Location</Label>
              <Input
                id="meeting-location"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="Zoom / Conference Room"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time <span className="text-red-500">*</span></Label>
                <DateTimePicker value={meetingStartTime} onChange={setMeetingStartTime} />
              </div>
              <div className="grid gap-2">
                <Label>End Time <span className="text-red-500">*</span></Label>
                <DateTimePicker value={meetingEndTime} onChange={setMeetingEndTime} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting-attendees">Attendees (comma separated emails)</Label>
              <Input
                id="meeting-attendees"
                value={meetingAttendees}
                onChange={(e) => setMeetingAttendees(e.target.value)}
                placeholder="guest1@example.com, guest2@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                placeholder="Discuss project updates..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMeetingModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={meetingMutation.isPending}>
                {meetingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}