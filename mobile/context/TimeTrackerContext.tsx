import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ActiveTimeLog, TimeLogSummary } from '@focuspilot/shared';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { parseActiveTimeLog } from '@/lib/time';

interface ClockInPayload {
  project?: number | null;
  task?: number | null;
  description?: string;
  studio?: number | null;
}

interface TimeTrackerContextValue {
  activeLog: ActiveTimeLog | null;
  summary: TimeLogSummary | null;
  isLoading: boolean;
  isClockingIn: boolean;
  isClockingOut: boolean;
  clockIn: (payload: ClockInPayload) => Promise<void>;
  clockOut: () => Promise<void>;
  refresh: () => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextValue | null>(null);

async function fetchActiveLog(): Promise<ActiveTimeLog | null> {
  const response = await api.get('/time_tracker/timelogs/active/');
  return parseActiveTimeLog(response.data);
}

async function fetchSummary(): Promise<TimeLogSummary> {
  const response = await api.get<TimeLogSummary>('/time_tracker/summary/');
  return response.data;
}

export function TimeTrackerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const activeQuery = useQuery({
    queryKey: ['time_tracker/timelogs/active/'],
    queryFn: fetchActiveLog,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  const summaryQuery = useQuery({
    queryKey: ['time_tracker/summary/'],
    queryFn: fetchSummary,
    enabled: isAuthenticated,
  });

  const invalidateTime = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['time_tracker/timelogs/active/'] });
    queryClient.invalidateQueries({ queryKey: ['time_tracker/summary/'] });
    queryClient.invalidateQueries({ queryKey: ['time_tracker/user-time-logs/'] });
  }, [queryClient]);

  const clockInMutation = useMutation({
    mutationFn: async (payload: ClockInPayload) => {
      await api.post('/time_tracker/clock-in/', {
        ...payload,
        studio: payload.studio ?? user?.studio?.id ?? null,
      });
    },
    onSuccess: invalidateTime,
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/time_tracker/clock-out/', {});
    },
    onSuccess: invalidateTime,
  });

  const value = useMemo<TimeTrackerContextValue>(
    () => ({
      activeLog: activeQuery.data ?? null,
      summary: summaryQuery.data ?? null,
      isLoading: activeQuery.isLoading || summaryQuery.isLoading,
      isClockingIn: clockInMutation.isPending,
      isClockingOut: clockOutMutation.isPending,
      clockIn: async payload => {
        await clockInMutation.mutateAsync(payload);
      },
      clockOut: async () => {
        await clockOutMutation.mutateAsync();
      },
      refresh: () => {
        activeQuery.refetch();
        summaryQuery.refetch();
      },
    }),
    [
      activeQuery,
      summaryQuery,
      clockInMutation,
      clockOutMutation,
    ],
  );

  return <TimeTrackerContext.Provider value={value}>{children}</TimeTrackerContext.Provider>;
}

export function useTimeTracker() {
  const ctx = useContext(TimeTrackerContext);
  if (!ctx) {
    throw new Error('useTimeTracker must be used within TimeTrackerProvider');
  }
  return ctx;
}
