'use client';

import { Clock, Pause, ChevronDown, Filter, ClockAlert, Info, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HomeNav } from '@/components/home-nav';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchData, postData } from '@/lib/Api';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { gooeyToast as toast } from 'goey-toast';
import useUser from '@/hooks/useUser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/DeleteDialog';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import useDeleteData from '@/hooks/useDelete';
import { Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { DateTimePicker } from '@/components/ui/datetime-picker';

const AnimatedClock = ({ running = false, className = '' }: { running?: boolean; className?: string }) => {
  return (
    <>
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
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

// earthy accent for bars
const olive = '#6c7f57';
const oliveDeep = '#4b5d39';

// Also update the formatTime function to handle NaN/undefined cases:
const formatTime = (ms: any) => {
  // Handle NaN, undefined, or null values
  if (isNaN(ms) || ms === null || ms === undefined) {
    return '0h 0m 0s';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

// Convert duration string (HH:MM:SS) to milliseconds
const durationToMs = (duration: string): number => {
  if (!duration) return 0;
  const parts = duration.split(':');
  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

const TimeLogItem = ({ task, openTaskModal, isTimerActive, handleStartNewSession, handlePauseTracking }) => {


  return (
    <li onClick={() => {
      openTaskModal(task)
    }} className="flex items-center hover:shadow-md duration-300 cursor-pointer justify-between rounded-xl border bg-white px-4 py-4">
      <div className="flex w-1/2 items-start gap-3.5">
        <div
          className={
            task?.isActive && !task?.isPaused
              ? 'flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[#efeae2] bg-stone-50'
              : 'flex min-h-10 min-w-10 items-center justify-center rounded-full border bg-white'
          }
        >
          {task?.isActive && !task?.isPaused ? (
            <AnimatedClock running={true} />
          ) : (
            <Clock className="h-4 w-4 text-neutral-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base capitalize font-semibold text-neutral-900 truncate cursor-pointer" >
            {task?.task?.title || 'Studio Management'}
          </p>
          <p className="text-xs md:text-sm text-neutral-500 truncate">
            {task?.project?.project_name || 'Studio Task'}
          </p>
        </div>
      </div>

      <div className="flex w-1/2 items-center justify-end gap-4">
        {!task?.isActive && <div className="text-sm md:text-base font-semibold text-neutral-900">{task?.duration || '00:00:00'}</div>}
        <div className="text-xs md:text-sm text-neutral-500">
          {
            new Date(task?.timerStart.replace("Z", "")).toLocaleDateString(
              "en-GB",
              { month: "short", day: "numeric" }
            )
          }

        </div>

        <Button
          // disabled={isTimerActive}
          onClick={(e) => {
            e.stopPropagation()
            if (task?.isActive && !task?.isPaused) {
              handlePauseTracking()
            } else {
              handleStartNewSession(task);
            }


          }}
          className={`rounded-md border-neutral-200 bg-stone-100 px-3 py-1 text-xs font-medium text-neutral-800 hover:text-white`}
        >
          {task?.isActive && !task?.isPaused ? <Pause className="w-4 h-4 inline" /> : <Play className="w-4 h-4 inline" />}

        </Button>
      </div>
    </li>
  );
};

export default function HomeTimePage() {
  const [selectedRange, setSelectedRange] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('Default');
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // State for editing session
  const [editingSessionId, setEditingSessionId] = useState<string | number | null>(null);
  const [editStartDateTime, setEditStartDateTime] = useState<Date | undefined>(undefined);
  const [editEndDateTime, setEditEndDateTime] = useState<Date | undefined>(undefined);

  const queryClient = useQueryClient();
  const { user } = useUser();

  const {
    data: trackingData,
    isLoading: trackingLoading,
    refetch,
  } = useFetch('time_tracker/user-time-logs/', {
    enabled: !!user?.email,
  });

  // Fetch sessions for active task
  const { data: activeSessionsData, refetch: refetchActiveTaskSessions } = useFetch(
    activeTask ? `time_tracker/user-time-sessions?time_log_id=${activeTask.id}` : null,
    { enabled: !!activeTask }
  );

  // Fetch sessions for the selected task (for modal)
  const { data: selectedTaskSessions, refetch: refetchSelectedTaskSessions } = useFetch(
    selectedTask ? `time_tracker/user-time-sessions?time_log_id=${selectedTask.id}` : null,
    { enabled: !!selectedTask }
  );

  // Fetch Summary from new API
  const { data: summaryData } = useFetch('time_tracker/summary/', {
    enabled: !!user?.email,
  });

  const { mutate: createSession } = useMutation({
    mutationFn: async (data: any) => {
      return await postData({ url: data.url, data: data.data });
    },
    onSuccess: () => {
      toast.success('New session started');
      refetch();
      refetchActiveTaskSessions();
      queryClient.refetchQueries({ queryKey: ['task/user-tasks/'] });
    },
    onError: () => {
      toast.error('Failed to start session');
    },
  });

  const handleStartNewSession = (task: any) => {
    // const payload = {
    //   clock_status: 'ON',
    //   description: task?.description || '',
    //   user: task?.user || 0,
    //   project: task?.project?.id || 0,
    //   task: task?.task?.id || 0,
    //   studio: task?.studio || 0,
    // };

    createSession({
      url: 'time_tracker/sessions/',
      data: {
        start_time: new Date().toISOString(), // Start from last session end or task creation
        // end_time: new Date().toISOString(),
        time_log: task.id
      }
    });

    // createSession({
    //   url: `time_tracker/timelogs/${task?.id}/`,
    //   data: payload,
    // });
  };

  const stopMutation = usePost({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['Time Tracking'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/summary/'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/user-time-logs/'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/timelogs/active/'] });
      queryClient.refetchQueries({ queryKey: ['task/user-tasks/'] });
      refetch();
      refetchSelectedTaskSessions();
      refetchActiveTaskSessions();
      toast('Timer Stopped');
      setElapsedTime(0);
    },
    onError: () => {
      toast('Error stopping timer');
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ url, data }: { url: string; data: any }) => patchData({ url, data }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['time_tracker/user-time-logs/'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/summary/'] });
      // Refetch sessions for the selected task to update total time
      if (selectedTask?.id) {
        queryClient.refetchQueries({
          queryKey: [`time_tracker/user-time-sessions?time_log_id=${selectedTask.id}`]
        });
      }
      toast('Session updated successfully');
    },
    onError: () => {
      toast('Error updating session');
    }
  });

  const { mutate: deleteSessionMutation } = useDeleteData({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['time_tracker/user-time-logs/'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/summary/'] });
      queryClient.refetchQueries({ queryKey: ['time_tracker/timelogs/active/'] });
      if (selectedTask?.id) {
        queryClient.refetchQueries({
          queryKey: [`time_tracker/user-time-sessions?time_log_id=${selectedTask.id}`]
        });
      }
      toast('Session deleted successfully');
      setIsDeleteOpen(false);
    },
    onError: () => {
      toast('Error deleting session');
    }
  });


  useEffect(() => {
    document.title = 'Time Tracker | Focuspilot';
  }, []);

  // Process task data when received
  useEffect(() => {
    if (trackingLoading) return;
    // Handle if trackingData is the array directly or wrapped in data property
    const dataToProcess = Array.isArray(trackingData) ? trackingData : trackingData?.data || [];
    if (!dataToProcess) return;
    const processedTasks = dataToProcess.map((item: any) => ({
      ...item,
      isActive: item.clock_status === 'ON',
      isPaused: item.clock_status === 'PAUSED',
      timerStart: item.created_at,
      startTime: new Date(item.created_at).getTime(),
      duration: item.duration || '00:00:00',
    })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setTasks(processedTasks);
    // Find the active task
    const active = processedTasks.find((task: any) => task.isActive);
    setActiveTask(active || null);
  }, [trackingData, trackingLoading, user?.id]);

  // Sync selectedTask with updated tasks
  useEffect(() => {
    if (selectedTask && tasks.length > 0) {
      const updated = tasks.find((t: any) => t.id === selectedTask.id);
      if (updated && (updated.isActive !== selectedTask.isActive || updated.isPaused !== selectedTask.isPaused || updated.duration !== selectedTask.duration)) {
        setSelectedTask(updated);
        // Update elapsed time if this is the active task
        if (activeTask && updated.id === activeTask.id && updated.duration) {
          setElapsedTime(durationToMs(updated.duration));
        }
      }
    }
  }, [tasks, activeTask]);

  // Update elapsed time for active task based on startTime timestamp
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    // No active task → stop timer AND reset
    if (!activeTask) {
      setElapsedTime(0);
      return;
    }


    const calculateElapsedTime = () => {
      const currentTime = Date.now();

      // Calculate total time from completed sessions
      const sessions = Array.isArray(activeSessionsData) ? activeSessionsData : (activeSessionsData?.data || []);
      const pastSessionsDuration = sessions.reduce((acc: number, s: any) => {
        // Skip sessions without end time to avoid double counting current session
        if (!s.end_time && !s.endTime) return acc;

        const start = s.start_time ? new Date(s.start_time).getTime() : new Date(s.startTime).getTime();
        const end = s.end_time ? new Date(s.end_time).getTime() : new Date(s.endTime).getTime();
        return acc + (end - start);
      }, 0);

      // Calculate current session time
      // Use updated_at as the start of the current active session
      // If updated_at is missing (e.g. new task), fallback to created_at
      const currentSessionStart = activeTask.updated_at
        ? new Date(activeTask.updated_at).getTime()
        : (activeTask.startTime || currentTime);

      const currentSessionDuration = (activeTask.isActive && !activeTask.isPaused)
        ? Math.max(0, currentTime - currentSessionStart)
        : 0;

      return pastSessionsDuration + currentSessionDuration;
    };

    // Set initial time
    setElapsedTime(calculateElapsedTime());

    // Run timer only when active & not paused
    if (activeTask.isActive && !activeTask.isPaused) {
      interval = setInterval(() => {
        setElapsedTime(calculateElapsedTime());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTask, activeSessionsData]);


  const handlePauseTracking = useCallback(() => {
    if (!activeTask) return;

    // Calculate start_time for the new session
    let startTime = activeTask.updated_at || activeTask.created_at;
    const sessions = Array.isArray(activeSessionsData) ? activeSessionsData : (activeSessionsData?.data || []);

    if (!activeTask.updated_at && sessions && sessions.length > 0) {
      // Find the latest end_time from sessions
      const sortedSessions = [...sessions].sort((a: any, b: any) => {
        const timeA = a.end_time ? new Date(a.end_time).getTime() : 0;
        const timeB = b.end_time ? new Date(b.end_time).getTime() : 0;
        return timeB - timeA;
      });

      if (sortedSessions[0].end_time) {
        startTime = sortedSessions[0].end_time;
      }
    }

    // stopMutation.mutate({
    //   url: 'time_tracker/sessions/',
    //   data: {
    //     start_time: startTime, // Start from last session end or task creation
    //     end_time: new Date().toISOString(),
    //     time_log: activeTask.id
    //   }
    // });
    stopMutation.mutate({
      url: 'time_tracker/clock-out/',
      data: {
        time_log_id: activeTask.id,
        clock_status: 'OFF'
      }
    });


  }, [activeTask, stopMutation, activeSessionsData]);

  const handleEditSession = (session: any) => {
    setEditingSessionId(session.id);
    // Set full Date objects for date and time
    const start = session.start_time ? new Date(session.start_time) : new Date(session.startTime);
    const end = session.end_time ? new Date(session.end_time) : (session.endTime ? new Date(session.endTime) : undefined);

    setEditStartDateTime(start);
    setEditEndDateTime(end);
  };

  const handleSaveSession = (session: any) => {
    if (!editStartDateTime || !editEndDateTime) return;

    updateSessionMutation.mutate({
      url: `time_tracker/sessions/${session.id}/`,
      data: {
        start_time: editStartDateTime.toISOString(),
        end_time: editEndDateTime.toISOString(),
        time_log: session.time_log?.id || session.time_log || selectedTask.id // Ensure time_log ID is present
      }
    });

    setEditingSessionId(null);
    setEditStartDateTime(undefined);
    setEditEndDateTime(undefined);
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditStartDateTime(undefined);
    setEditEndDateTime(undefined);
  };

  const closeModal = useCallback(() => {
    // setSelectedTask(null);
    setModalOpen(false);

  }, []);

  const openTaskModal = useCallback(task => {
    setSelectedTask(task);
    setModalOpen(true);
  }, []);

  const filterTask = useMemo(() => {
    if (!tasks.length) return [];
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const last7Days = new Date();
    last7Days.setDate(currentDate.getDate() - 7);

    // First, filter by date range
    let filteredTasks = [...tasks];

    if (selectedRange === 'Week') {
      filteredTasks = filteredTasks.filter(item => new Date(item.timerStart) >= last7Days);
    } else if (selectedRange === 'Month') {
      filteredTasks = filteredTasks.filter(item => new Date(item.timerStart) >= startOfMonth);
    }

    // Then apply status filters
    if (selectedFilter === 'Active') {
      filteredTasks = filteredTasks.filter(item => item.isActive);
    } else if (selectedFilter === 'Paused') {
      filteredTasks = filteredTasks.filter(item => !item.isActive); // Only if active but paused
    }

    // Sort by `timerStart` (newest first)
    return filteredTasks.sort((a, b) => new Date(b.timerStart).getTime() - new Date(a.timerStart).getTime());
  }, [selectedRange, selectedFilter, tasks]);

  // Live timer for modal
  useEffect(() => {
    if (!selectedTask || !selectedTask.totalWorkTime) {
      setElapsedTime(0);
      return;
    }

    let interval;

    // Ensure all values are numbers and valid
    const startTime = Number(selectedTask.startTime) || 0;
    const totalWorkTime = Number(selectedTask.totalWorkTime) || 0;
    const isActive = Boolean(selectedTask.isActive);
    const isPaused = Boolean(selectedTask.isPaused);

    if (isActive && !isPaused) {
      // Initial calculation with proper number validation
      const initialTime = startTime === 0 ? totalWorkTime : Date.now() - startTime + totalWorkTime;

      setElapsedTime(initialTime);

      // Update every second
      interval = setInterval(() => {
        const currentTime = Date.now();
        const newTime = startTime === 0 ? totalWorkTime : currentTime - startTime + totalWorkTime;

        setElapsedTime(newTime);
      }, 1000);
    } else {
      // For paused or inactive tasks, just show the total work time
      setElapsedTime(totalWorkTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTask]);

  useEffect(() => {
    if (selectedTask?.isActive && !selectedTask?.isPaused) {
      setIsTimerActive(true);
    } else if (selectedTask?.isPaused || !selectedTask?.isActive) {
      setIsTimerActive(false);
    }
  }, [selectedTask]);

  const deleteSession = (sessionId: number) => {
    if (!sessionId) return;
    deleteSessionMutation({ url: `time_tracker/sessions/${sessionId}/` });
  };

  const openDeleteModal = session => {
    setIsDeleteOpen(true);
    setSelectedSession(session);
  };


  return (
    <main className="space-y-6 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Global horizontal nav (stable across Home pages) */}
        <HomeNav />

        {/* Filters */}
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex bg-white rounded-xl items-center gap-2">
                {selectedRange} <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-white">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedRange('All')}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedRange('Week')}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedRange('Month')}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex bg-white rounded-xl items-center gap-2">
                <Filter /> {selectedFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-white">
              <DropdownMenuItem onClick={() => setSelectedFilter('Default')}>Default</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('Active')}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('Paused')}>Paused</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tracker card */}
        {activeTask && (
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto,1fr,auto] md:items-center">
                {/* Compact static time display */}
                <div
                  aria-label="Elapsed time"
                  className="tabular-nums font-bold leading-none tracking-tight text-neutral-900 text-2xl md:text-3xl"
                >
                  {formatTime(elapsedTime)}
                </div>

                {/* Context */}
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-neutral-900">{activeTask?.task?.title || 'Studio Management'}</div>
                  <div className="text-sm text-neutral-500">
                    {activeTask?.project?.project_name || 'Studio Task'}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-start gap-3 md:justify-end">
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl bg-transparent px-3.5"
                    onClick={handlePauseTracking}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    {'Pause'}
                  </Button>
                  {/* <Button variant="outline" className="h-9 rounded-xl bg-transparent px-3.5" onClick={handleStopTracking}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button> */}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two-column content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* This Week */}
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <h2 className="text-base md:text-lg font-semibold text-neutral-900">Time Summary</h2>

              <div className="mt-5 space-y-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-neutral-600">Today</span>
                  <span className="text-2xl font-bold text-neutral-900 md:text-3xl">
                    {summaryData?.today && `${summaryData.today.hours}`}<span className="text-lg">h</span>{' '}
                    {summaryData?.today && `${summaryData.today.minutes}`}<span className="text-lg">m</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-neutral-600">This Week</span>
                  <span className="text-xl font-semibold md:text-2xl" style={{ color: oliveDeep }}>
                    {summaryData?.this_week && `${summaryData.this_week.hours}`}<span className="text-lg">h</span>{' '}
                    {summaryData?.this_week && `${summaryData.this_week.minutes}`}<span className="text-lg">m</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-neutral-600">This Month</span>
                  <span className="text-xl font-semibold text-neutral-700 md:text-2xl">
                    {summaryData?.this_month && `${summaryData.this_month.hours}`}<span className="text-lg">h</span>{' '}
                    {summaryData?.this_month && `${summaryData.this_month.minutes}`}<span className="text-lg">m</span>
                  </span>
                </div>
              </div>

              {/* Daily breakdown */}
              <div className="mt-5">
                <div className="font-medium text-neutral-800">Daily Breakdown</div>
                <ul className="mt-4 space-y-2.5">
                  {summaryData?.daily_breakdown?.map((d: any) => {
                    // Scale to 8h max, with minimum 2% width so it's always visible
                    const pct = Math.max(2, Math.min(100, (d.hours / 8) * 100));
                    // Only show Mon-Fri or all days? The API returns Mon-Sun.
                    // Let's show all returned days or filter if needed. 
                    // The UI previously showed Mon-Fri. Let's stick to what API gives but maybe filter if user wants only weekdays.
                    // For now, I'll render what the API gives.
                    return (
                      <li key={d.date} className="grid grid-cols-[36px,1fr,40px] items-center gap-3">
                        <span className="text-sm text-neutral-600">{d.day.substring(0, 3)}</span>
                        <div className="h-1 rounded-full bg-stone-200">
                          <div
                            className="h-1 rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: olive,
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                        <span className="text-sm flex gap-1 tabular-nums text-neutral-700"> <span>{d.hours}h</span> <span>{d.minutes}m</span></span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card className="rounded-2xl max-h-[700px] overflow-y-auto">
            <CardContent className="p-5 pt-3">
              <div className="flex items-center justify-between sticky top-0 left-0 bg-white pb-1 pt-3">
                <h2 className="text-base md:text-lg font-semibold text-neutral-900">Recent Entries</h2>
                {/* <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                  View All
                </a> */}
              </div>

              <ul className="mt-5 space-y-3">
                {filterTask.map(task => (
                  <TimeLogItem
                    key={task.id}
                    task={task}
                    openTaskModal={openTaskModal}
                    isTimerActive={isTimerActive}
                    handleStartNewSession={handleStartNewSession}
                    handlePauseTracking={handlePauseTracking}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Time Tracker Modal */}
        <Dialog open={modalOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-[700px] scrollbar-hide overflow-y-scroll max-h-[90vh] bg-white py-6 flex flex-col">
            <div className="navbar mb-[30px] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold flex items-center gap-2">Time Tracker</div>
              </div>
            </div>

            {/* Modal Content */}
            {selectedTask && (
              <div className="h-full">
                <div className="space-y-4 flex-col flex w-full h-full">
                  <div className="flex-1">
                    <div className="flex w-full justify-between items-center">
                      <div>
                        <div>
                          <p className="text-black text-[36px] font-semibold ">
                            {(() => {
                              if (activeTask && selectedTask.id === activeTask.id) {
                                return formatTime(elapsedTime);
                              }
                              const sessions = selectedTaskSessions || selectedTask.session || [];
                              const totalMs = sessions.reduce((acc: number, s: any) => {
                                const start = s.start_time ? new Date(s.start_time).getTime() : new Date(s.startTime).getTime();
                                const end = s.end_time ? new Date(s.end_time).getTime() : (s.endTime ? new Date(s.endTime).getTime() : Date.now());
                                return acc + (end - start);
                              }, 0);
                              return formatTime(totalMs);
                            })()}
                          </p>
                        </div>
                        <p className="text-[#525866] text-[16px] font-medium">Total Time</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={selectedTask.isActive}
                          onCheckedChange={checked => {
                            if (checked) {
                              handleStartNewSession(selectedTask);
                            } else {
                              // Pause tracking
                              handlePauseTracking();
                            }
                          }}
                          id="timer-toggle"
                          className="scale-150 rounded-lg data-[state=checked]:bg-green-500"
                        />
                        {/* {selectedTask.isActive && (
                    )} */}
                      </div>
                    </div>

                    {/* --- Session History Section --- */}
                    <div className="mt-6">
                      <h3 className="text-md font-semibold mb-3">Session History</h3>
                      <div className="overflow-x-auto border rounded-lg scrollbar scrollbar-thin">
                        <table className="w-full   text-left border-collapse">
                          <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Start Time</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">End Time</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total Time</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 text-sm">
                            {(selectedTaskSessions || selectedTask.session || []).map((s: any, idx: number) => {
                              // Handle both new API format and old format
                              const startTime = s.start_time ? new Date(s.start_time) : new Date(s.startTime);
                              const endTime = s.end_time ? new Date(s.end_time) : (s.endTime ? new Date(s.endTime) : null);

                              const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              const endStr = endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Running';

                              const totalMs = endTime ? (endTime.getTime() - startTime.getTime()) : (Date.now() - startTime.getTime());
                              const totalMins = Math.floor(totalMs / 60000);
                              const totalSecs = Math.floor((totalMs % 60000) / 1000);
                              const sessionDate = startTime.toLocaleDateString();

                              return (
                                <tr key={s.id || idx} className="hover:bg-stone-50 text-xs">
                                  <td className="px-4 py-2 border-b">{sessionDate}</td>
                                  <td className="px-4 py-2 border-b">
                                    {editingSessionId === s.id ? (
                                      <DateTimePicker
                                        value={editStartDateTime}
                                        onChange={setEditStartDateTime}
                                        placeholder="Select start date & time"
                                        className="h-8 text-xs"
                                        displayTimeOnly={true}
                                      />
                                    ) : (
                                      startStr
                                    )}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {editingSessionId === s.id ? (
                                      <DateTimePicker
                                        value={editEndDateTime}
                                        onChange={setEditEndDateTime}
                                        placeholder="Select end date & time"
                                        className="h-8 text-xs"
                                        displayTimeOnly={true}
                                      />
                                    ) : (
                                      endStr
                                    )}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {(() => {
                                      const hours = Math.floor(totalMs / 3600000);
                                      const minutes = Math.floor((totalMs % 3600000) / 60000);
                                      const seconds = Math.floor((totalMs % 60000) / 1000);

                                      const parts = [];
                                      if (hours > 0) parts.push(`${hours}h`);
                                      parts.push(`${minutes}m`);
                                      parts.push(`${seconds}s`);
                                      return parts.join(' ');
                                    })()}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {editingSessionId === s.id ? (
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSaveSession(s)} className="h-7 px-2 text-xs">Save</Button>
                                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 px-2 text-xs">Cancel</Button>
                                      </div>
                                    ) : (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-[999]" align="end">

                                          <DropdownMenuItem onClick={() => handleEditSession(s)}>
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={() => openDeleteModal(s)} className="text-red-600 cursor-pointer">
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>


                    <DeleteDialog
                      isOpen={isDeleteOpen}
                      onClose={() => setIsDeleteOpen(false)}
                      onConfirm={() => deleteSession(selectedSession?.id)}
                      title="Delete Session"
                      description="Are you sure you want to delete this session? This action cannot be undone."
                      // itemName={selected?.name}
                      requireConfirmation={false}
                    />

                    <div className="mt-6">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="note">Note</Label>
                        <Input
                          value={selectedTask.note || ''}
                          onChange={e =>
                            setSelectedTask((prev: any) => ({
                              ...prev,
                              note: e.target.value,
                            }))
                          }
                          className="bg-white py-7 rounded-xl"
                          id="note"
                          name="note"
                          placeholder="What are you working on?"
                        />
                      </div>

                      {/* <div className="space-y-2 mt-4 col-span-2">
                        <Label htmlFor="memo">Latest Screen Capture</Label>
                        <div className="rounded-xl py-[50px] flex-col border flex items-center justify-center">
                          <div className="bg-[#ECEFEC] p-[27px] rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="43" viewBox="0 0 44 43" fill="none">
                              <path
                                opacity="0.4"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M22.1335 2.6875H21.8665C17.968 2.68746 14.8599 2.68743 12.423 3.01505C9.90684 3.35336 7.83962 4.07022 6.20492 5.70492C4.57022 7.33962 3.85336 9.40684 3.51505 11.923C3.18743 14.3599 3.18746 17.468 3.1875 21.3665V21.6335C3.18746 25.532 3.18743 28.6402 3.51505 31.077C3.85336 33.5932 4.57022 35.6604 6.20492 37.2952C7.83962 38.9299 9.90684 39.6467 12.423 39.985C14.8599 40.3125 17.968 40.3125 21.8667 40.3125H22.1333C26.032 40.3125 29.14 40.3125 31.577 39.985C34.0932 39.6467 36.1604 38.9299 37.7952 37.2952C39.4299 35.6604 40.1467 33.5932 40.485 31.077C40.8125 28.64 40.8125 25.532 40.8125 21.6333V21.3667C40.8125 17.468 40.8125 14.3599 40.485 11.923C40.1467 9.40684 39.4299 7.33962 37.7952 5.70492C36.1604 4.07022 34.0932 3.35336 31.577 3.01505C29.1402 2.68743 26.032 2.68746 22.1335 2.6875Z"
                                fill="#587158"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M13.9349 9.85352C11.9559 9.85352 10.3516 11.4578 10.3516 13.4368C10.3516 15.4159 11.9559 17.0202 13.9349 17.0202C15.9139 17.0202 17.5182 15.4159 17.5182 13.4368C17.5182 11.4578 15.9139 9.85352 13.9349 9.85352ZM12.8955 36.4329C12.677 36.4035 12.4685 36.3716 12.2692 36.3369C15.682 32.2092 19.1601 28.0388 23.0668 25.4192C25.3243 23.9056 27.6462 22.9705 30.0995 22.8553C32.2504 22.7541 34.6052 23.2779 37.2164 24.7467C37.1977 27.1673 37.1357 29.0584 36.9286 30.5989C36.6437 32.7177 36.1143 33.9027 35.2563 34.7605C34.3984 35.6186 33.2134 36.148 31.0946 36.4329C28.9242 36.7248 26.0575 36.7285 21.9951 36.7285C17.9325 36.7285 15.0659 36.7248 12.8955 36.4329Z"
                                fill="#587158"
                              />
                            </svg>
                          </div>
                          <p className="text-[#787C86] text-[16px] font-medium mt-4">No Captures Yet</p>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>

        </Dialog>

      </div>
    </main>
  );
}
