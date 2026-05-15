import { useState, useCallback } from 'react';
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  addYears,
  subYears,
} from 'date-fns';

export type CalendarView = 'month' | 'week' | 'day';
export type CalendarMode = 'calendar' | 'timeline';
export type FilterType = 'all' | 'phases' | 'delivery' | 'tasks';

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  mode: CalendarMode;
  selectedDate: Date;
  searchQuery: string;
  filterType: FilterType;
  enabledFilters: Set<'phases' | 'deliveries' | 'tasks'>;
}

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [mode, setMode] = useState<CalendarMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [enabledFilters, setEnabledFilters] = useState<Set<'phases' | 'deliveries' | 'tasks'>>(
    new Set(['phases', 'deliveries', 'tasks'])
  );

  const handlePrev = useCallback(() => {
    if (mode === 'timeline') {
      if (view === 'day') setCurrentDate(subMonths(currentDate, 1));
      else if (view === 'week') setCurrentDate(subMonths(currentDate, 1));
      else setCurrentDate(subYears(currentDate, 1));
      return;
    }
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(addDays(currentDate, -1));
  }, [currentDate, mode, view]);

  const handleNext = useCallback(() => {
    if (mode === 'timeline') {
      if (view === 'day') setCurrentDate(addMonths(currentDate, 1));
      else if (view === 'week') setCurrentDate(addMonths(currentDate, 1));
      else setCurrentDate(addYears(currentDate, 1));
      return;
    }
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
  }, [currentDate, mode, view]);

  const handleToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  }, []);

  const toggleFilter = useCallback((filter: 'phases' | 'deliveries' | 'tasks') => {
    setEnabledFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });
  }, []);

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    mode,
    setMode,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    enabledFilters,
    toggleFilter,
    handlePrev,
    handleNext,
    handleToday,
  };
}
