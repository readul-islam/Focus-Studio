import { useMemo } from 'react';
import { isWithinInterval, startOfDay, endOfDay, isSameDay, parseISO } from 'date-fns';

export interface Phase {
  id: number;
  name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  progress: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  colorIndex?: number;
}

export interface DeliveryDate {
  id: number;
  product_name: string;
  project_name: string;
  ETA: string;
  deliveryDate?: Date;
  colorIndex?: number;
}

export interface Task {
  id: number;
  title: string;
  project_name: string;
  start_date: string;
  end_date: string;
  status: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useCalendarFilters(
  phases: Phase[],
  deliveryDates: DeliveryDate[],
  tasks: Task[],
  searchQuery: string,
  enabledFilters: Set<'phases' | 'deliveries' | 'tasks'>
) {
  // Parse phases
  const parsedPhases = useMemo(() => {
    if (!Array.isArray(phases)) return [];

    const parsed = phases
      .map((phase: any, i: number) => ({
        ...phase,
        startDate: phase.start_date ? parseISO(phase.start_date.toString().substring(0, 10)) : null,
        endDate: phase.end_date ? parseISO(phase.end_date.toString().substring(0, 10)) : null,
        colorIndex: i,
      }))
      .filter((p: any) => p.startDate && p.endDate);

    return parsed;
  }, [phases]);

  // Parse delivery dates
  const parsedDeliveryDates = useMemo(() => {
    if (!Array.isArray(deliveryDates)) return [];

    return deliveryDates
      .map((delivery: any, i: number) => ({
        ...delivery,
        deliveryDate: delivery.ETA ? parseISO(delivery.ETA.toString().substring(0, 10)) : null,
        colorIndex: i,
      }))
      .filter((d: any) => d.deliveryDate);
  }, [deliveryDates]);

  // Parse tasks
  const parsedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    return tasks
      .map((task: any) => ({
        ...task,
        startDate: task.start_date ? parseISO(task.start_date.toString().substring(0, 10)) : null,
        endDate: task.end_date ? parseISO(task.end_date.toString().substring(0, 10)) : null,
      }))
      .filter((t: any) => t.startDate && t.endDate);
  }, [tasks]);

  // Filter phases
  const filteredPhases = useMemo(() => {
    return parsedPhases.filter(
      (p: any) =>
        enabledFilters.has('phases') &&
        (!searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.project_name && p.project_name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [parsedPhases, searchQuery, enabledFilters]);

  // Filter delivery dates
  const filteredDeliveryDates = useMemo(() => {
    return parsedDeliveryDates.filter(
      (d: any) =>
        enabledFilters.has('deliveries') &&
        (!searchQuery ||
          d.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.project_name && d.project_name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [parsedDeliveryDates, searchQuery, enabledFilters]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return parsedTasks.filter(
      (t: any) =>
        enabledFilters.has('tasks') &&
        (!searchQuery ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.project_name && t.project_name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [parsedTasks, searchQuery, enabledFilters]);

  // Get items for selected date
  const getItemsForDate = useMemo(
    () => (selectedDate: Date) => {
      const phasesForDate = filteredPhases.filter((p: any) =>
        isWithinInterval(selectedDate, { start: startOfDay(p.startDate), end: endOfDay(p.endDate) })
      );

      const deliveriesForDate = filteredDeliveryDates.filter((d: any) => isSameDay(d.deliveryDate, selectedDate));

      const tasksForDate = filteredTasks.filter((t: any) =>
        isWithinInterval(selectedDate, { start: startOfDay(t.startDate), end: endOfDay(t.endDate) })
      );

      return {
        phases: phasesForDate,
        deliveries: deliveriesForDate,
        tasks: tasksForDate,
      };
    },
    [filteredPhases, filteredDeliveryDates, filteredTasks]
  );

  return {
    filteredPhases,
    filteredDeliveryDates,
    filteredTasks,
    getItemsForDate,
  };
}
