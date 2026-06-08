import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  CalendarDelivery,
  CalendarGoogleEvent,
  CalendarPhase,
  IntegrationStatus,
} from '@focuspilot/shared';
import {
  buildDeliveryEntries,
  buildMeetingEntries,
  buildPhaseEntries,
  getMonthFetchRange,
  type CalendarEntry,
} from '@/lib/calendar';
import { api } from '@/lib/api';

async function fetchPhases(): Promise<CalendarPhase[]> {
  const response = await api.get<CalendarPhase[]>('/projects/studio-phases/');
  return response.data;
}

async function fetchDeliveries(): Promise<CalendarDelivery[]> {
  const response = await api.get<CalendarDelivery[]>('/projects/studio-delivery-dates/');
  return response.data;
}

async function fetchIntegrationStatus(): Promise<IntegrationStatus> {
  const response = await api.get<IntegrationStatus>('/user/integration-status/');
  return response.data;
}

async function fetchGoogleEvents(timeMin: string, timeMax: string): Promise<CalendarGoogleEvent[]> {
  const response = await api.get<{ events: CalendarGoogleEvent[] }>('/gmail/calendar/events/', {
    params: { time_min: timeMin, time_max: timeMax, max_results: 250 },
  });
  return response.data.events ?? [];
}

export function useCalendar(month: Date) {
  const phasesQuery = useQuery({
    queryKey: ['projects/studio-phases/'],
    queryFn: fetchPhases,
  });

  const deliveriesQuery = useQuery({
    queryKey: ['projects/studio-delivery-dates/'],
    queryFn: fetchDeliveries,
  });

  const integrationQuery = useQuery({
    queryKey: ['user/integration-status/'],
    queryFn: fetchIntegrationStatus,
  });

  const calendarConnected = integrationQuery.data?.calendar_connected ?? false;
  const range = useMemo(() => getMonthFetchRange(month), [month]);

  const googleQuery = useQuery({
    queryKey: ['gmail/calendar/events/', range.timeMin, range.timeMax],
    queryFn: () => fetchGoogleEvents(range.timeMin, range.timeMax),
    enabled: calendarConnected,
  });

  const entries = useMemo<CalendarEntry[]>(() => {
    const phaseEntries = buildPhaseEntries(phasesQuery.data ?? []);
    const deliveryEntries = buildDeliveryEntries(deliveriesQuery.data ?? []);
    const meetingEntries = calendarConnected ? buildMeetingEntries(googleQuery.data ?? []) : [];
    return [...phaseEntries, ...deliveryEntries, ...meetingEntries];
  }, [phasesQuery.data, deliveriesQuery.data, googleQuery.data, calendarConnected]);

  const refetch = () => {
    phasesQuery.refetch();
    deliveriesQuery.refetch();
    integrationQuery.refetch();
    if (calendarConnected) googleQuery.refetch();
  };

  return {
    entries,
    calendarConnected,
    gmailConnected: integrationQuery.data?.gmail_connected ?? false,
    isLoading: phasesQuery.isLoading || deliveriesQuery.isLoading,
    isError: phasesQuery.isError || deliveriesQuery.isError,
    isRefetching:
      phasesQuery.isRefetching || deliveriesQuery.isRefetching || googleQuery.isRefetching,
    refetch,
  };
}
