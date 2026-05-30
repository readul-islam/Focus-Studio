'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Plus, Search, Clock, MoreHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter, useParams } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  format,
  isWithinInterval,
  parseISO,
  differenceInDays,
  addDays,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
} from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

export default function CalendarStudioPage() {
  const t = useTranslations('projectCalendarPage');
  const params = useParams();
  const projectId = params?.id;

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [mode, setMode] = useState<'calendar' | 'timeline'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'phases' | 'delivery_dates'>('all');

  // Fetch Phases
  const { data: phasesData, isLoading: phasesLoading } = useFetch(projectId ? `projects/project-phases/?project_id=${projectId}` : null);
  const { data: deliveryDatesData, isLoading: deliveryDatesLoading } = useFetch(
    projectId ? `projects/project-delivery-dates/?project_id=${projectId}` : null,
  );

  // Parse phases
  const phases = useMemo(() => {
    if (!Array.isArray(phasesData)) return [];

    // First map and filter
    const parsed = phasesData
      .map((phase: any) => ({
        ...phase,
        // Parse as local date by taking just the YYYY-MM-DD part
        startDate: phase.start_date ? parseISO(phase.start_date.toString().substring(0, 10)) : null,
        endDate: phase.end_date ? parseISO(phase.end_date.toString().substring(0, 10)) : null,
      }))
      .filter((p: any) => p.startDate && p.endDate);

    // Then assign sequential color index
    return parsed.map((p: any, i: number) => ({
      ...p,
      colorIndex: i,
    }));
  }, [phasesData]);

  // Parse delivery dates
  const deliveryDates = useMemo(() => {
    if (!Array.isArray(deliveryDatesData)) return [];

    return deliveryDatesData
      .map((delivery: any) => ({
        ...delivery,
        etaDate: delivery.ETA ? parseISO(delivery.ETA.toString().substring(0, 10)) : null,
      }))
      .filter((d: any) => d.etaDate);
  }, [deliveryDatesData]);

  // Derived Data
  const filteredPhases = useMemo(() => {
    return phases.filter((p: any) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [phases, searchQuery]);

  const phasesForSelectedDate = useMemo(() => {
    return filteredPhases.filter((p: any) => isWithinInterval(selectedDate, { start: startOfDay(p.startDate), end: endOfDay(p.endDate) }));
  }, [filteredPhases, selectedDate]);

  const deliveryDatesForSelectedDate = useMemo(() => {
    return deliveryDates.filter((d: any) => isSameDay(d.etaDate, selectedDate));
  }, [deliveryDates, selectedDate]);

  // Handlers
  const handlePrev = () => {
    if (mode === 'timeline') {
      setCurrentDate(subYears(currentDate, 1));
      return;
    }
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (mode === 'timeline') {
      setCurrentDate(addYears(currentDate, 1));
      return;
    }
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // --- RENDERING HELPERS ---

  // Helper to place items in rows for spanning visualization
  const getLayoutRows = (items: any[], rangeStart: Date, rangeEnd: Date) => {
    const sorted = [...items].sort((a, b) => {
      // Prioritize start date (earlier first)
      const startDiff = a.startDate.getTime() - b.startDate.getTime();
      if (startDiff !== 0) return startDiff;

      // Then duration (longer first)
      const durA = differenceInDays(a.endDate, a.startDate);
      const durB = differenceInDays(b.endDate, b.startDate);
      return durB - durA;
    });

    const rows: any[][] = [];

    sorted.forEach(item => {
      const itemStart = item.startDate < rangeStart ? rangeStart : item.startDate;
      const itemEnd = item.endDate > rangeEnd ? rangeEnd : item.endDate;

      if (item.endDate < rangeStart || item.startDate > rangeEnd) return;

      let rowIndex = 0;
      while (true) {
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }

        const hasCollision = rows[rowIndex].some(existing => {
          const existingStart = existing.startDate < rangeStart ? rangeStart : existing.startDate;
          const existingEnd = existing.endDate > rangeEnd ? rangeEnd : existing.endDate;
          return itemStart <= existingEnd && itemEnd >= existingStart;
        });

        if (!hasCollision) {
          rows[rowIndex].push(item);
          break;
        }
        rowIndex++;
      }
    });

    return rows;
  };

  const getPhaseLightColor = (id: number) => {
    const colors = [
      // bg green → darker muted green text
      'bg-[#8fa58f] text-[#3a4b3a]',
      // bg light beige → darker taupe text
      'bg-[#d9d5cc] text-[#5c5750]',
      // bg orange → darker brown text
      'bg-[#e07a57] text-[#e7e7e7]',
    ];
    return colors[id % colors.length];
  };

  const getPhaseColor = (id: number, rowIdx: number) => {
    const colors = [
      'bg-[#8fa58f] border-[#8fa58f]',
      'bg-[#d9d5cc] border-[#d9d5cc] !text-[#5c5750]',
      'bg-[#e07a57] border-[#e07a57] !text-[#e7e7e7]',
    ];
    return colors[id % colors.length];
  };

  // -- VIEWS --

  const renderGrid = (days: Date[], isMonthView: boolean) => {
    const start = days[0];
    const end = days[days.length - 1];

    const showPhases = filterType === 'all' || filterType === 'phases';
    const showDeliveries = filterType === 'all' || filterType === 'delivery_dates';

    // In week view, filtering just by range might miss items spanning ACROSS the week but starting/ending outside
    // But the logic below (startDate <= end AND endDate >= start) handles spans correctly.
    const phasesInRange = showPhases
      ? filteredPhases.filter((p: any) => p.startDate <= endOfDay(end) && p.endDate >= startOfDay(start))
      : [];

    // Group days into weeks for row rendering
    const weeks = [];
    let currentWeek: Date[] = [];
    days.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === days.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-y-scroll bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          {weeks.map((weekDays, weekIdx) => {
            const weekStart = weekDays[0];
            const weekEnd = weekDays[weekDays.length - 1];

            // Get rows for this specific week row
            const allRows = getLayoutRows(phasesInRange, weekStart, weekEnd);
            const visibleRows = allRows.slice(0, 3);
            const hiddenPhases = allRows.slice(3).flat();

            return (
              <div
                key={weekIdx}
                className={`flex-1 border-b  border-gray-100 relative group ${isMonthView ? 'min-h-[100px]' : 'min-h-[400px]'}`}
              >
                {/* Background Grid */}
                <div className="absolute inset-0  grid grid-cols-7 pointer-events-none">
                  {weekDays.map(d => {
                    const isToday = isSameDay(d, new Date());
                    const isCurrentMonth = isSameMonth(d, currentDate);
                    const isSelected = isSameDay(d, selectedDate);

                    return (
                      <div
                        key={d.toISOString()}
                        className={`
                                                border-r relative  border-gray-100 h-full p-2 transition-colors pointer-events-auto cursor-pointer
                                                ${!isCurrentMonth && isMonthView ? 'bg-stone-50/30' : 'bg-white'}
                                                ${isSelected ? '!bg-[#fffaf3]' : 'hover:bg-stone-50'}
                                            `}
                        onClick={() => setSelectedDate(d)}
                      >
                        <div className="flex justify-center">
                          <span
                            className={`
                                                        text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full
                                                        ${isToday ? 'bg-gray-900 text-white' : isCurrentMonth || !isMonthView ? 'text-gray-700' : 'text-gray-400'}
                                                    `}
                          >
                            {format(d, 'd')}
                          </span>
                        </div>

                        {/* Delivery Date Capsules */}
                        {(() => {
                          if (!showDeliveries) return null;

                          const deliveriesOnThisDay = deliveryDates.filter((delivery: any) => isSameDay(delivery.etaDate, d));

                          if (deliveriesOnThisDay.length > 0) {
                            return (
                              <div className="mt-1 space-y-1 h-full absolute w-full bottom-0 left-0 !z-[9999]">
                                {deliveriesOnThisDay.map((delivery: any) => (
                                  <TooltipProvider key={delivery.id}>
                                    <Tooltip>
                                      <TooltipTrigger
                                        asChild
                                        className={`absolute w-[calc(100%-6px)] ${filterType === 'delivery_dates' ? 'bottom-9' : 'bottom-[3px]'} left-[6px] !z-[9999]`}
                                      >
                                        <div className="bg-blue-100 text-blue-700 text-[10px] font-normal px-2 py-0.5 rounded-[12px] truncate cursor-pointer h-7 flex items-center">
                                          {delivery.product_name} Delivery
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="!z-[9999] relative">
                                        <div className="text-xs">
                                          <div className="font-normal">{delivery.product_name} Delivery</div>
                                          {/* <div className="text-gray-500">ETA: {format(delivery.etaDate, 'MMM d, yyyy')}</div> */}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {(() => {
                          if (!showPhases) return null;
                          const hiddenCount = hiddenPhases.filter(
                            (p: any) => p.startDate <= endOfDay(d) && p.endDate >= startOfDay(d),
                          ).length;

                          if (hiddenCount > 0) {
                            return (
                              <div className="absolute bottom-2 left-2  bg-stone-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                +{hiddenCount}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    );
                  })}
                </div>

                {/* Bars */}
                <div className="relative z-10 w-[98%] mx-auto  mt-10 pointer-events-none">
                  {visibleRows.map((rowItems, rowIdx) => (
                    <div key={rowIdx} className="relative h-7 mb-1 w-full text-xs">
                      {showPhases &&
                        rowItems.map((phase: any) => {
                          const phaseStartDay = phase.startDate < weekStart ? weekStart : phase.startDate;
                          // If week is partial (e.g. end of month), ensure we don't overflow
                          const phaseEndDay = phase.endDate > weekEnd ? weekEnd : phase.endDate;

                          const startOffset = differenceInDays(phaseStartDay, weekStart);
                          const duration = differenceInDays(phaseEndDay, phaseStartDay) + 1;

                          // Only render if visible in this week row
                          if (startOffset < 0 && startOffset + duration <= 0) return null;

                          return (
                            <TooltipProvider key={phase.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`
                                                                    absolute h-7  rounded-[12px] px-2 flex items-center truncate text-white pointer-events-auto hover:scale-[1.01] duration-300 cursor-pointer shadow-sm
                                                                    ${getPhaseColor(phase.colorIndex, rowIdx)}
                                                                `}
                                    style={{
                                      left: `${(startOffset / 7) * 100}%`,
                                      width: `calc(${(duration / 7) * 100}% - 0px)`,
                                      marginLeft: '0px',
                                      marginRight: '0px',
                                    }}
                                  >
                                    {(phase.startDate >= weekStart || weekIdx === 0) && phase.name}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="font-semibold">{phase.name}</div>
                                  <div className="text-xs">
                                    {format(phase.startDate, 'MMM d')} - {format(phase.endDate, 'MMM d')}
                                  </div>
                                  <div className="text-xs mt-1">Progress: {phase.progress}%</div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                    </div>
                  ))}
                  <div className="relative h-7 mb-1 w-full text-xs"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return renderGrid(days, true);
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return renderGrid(days, false);
  };

  const renderDayView = () => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);

    const showPhases = filterType === 'all' || filterType === 'phases';
    const showDeliveries = filterType === 'all' || filterType === 'delivery_dates';

    const activePhases = showPhases
      ? phases.filter((p: any) => isWithinInterval(currentDate, { start: startOfDay(p.startDate), end: endOfDay(p.endDate) }))
      : [];

    const activeDeliveries = showDeliveries ? deliveryDates.filter((d: any) => isSameDay(d.etaDate, currentDate)) : [];

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{format(currentDate, 'EEEE')}</h2>
            <p className="text-gray-500">{format(currentDate, 'MMMM do, yyyy')}</p>
          </div>
          <div className="flex gap-2">
            {activePhases.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {activePhases.length} Active Phase{activePhases.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {activeDeliveries.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200">
                {activeDeliveries.length} Delivery{activeDeliveries.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {activePhases.length === 0 && activeDeliveries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
            <p>No phases or deliveries scheduled for this day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePhases.map((phase: any, index: number) => (
              <div
                key={phase.id}
                className="p-4 rounded-xl border border-gray-100 bg-white hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">{phase.description}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getPhaseLightColor(phase.colorIndex)} bg-opacity-0`}>
                    {format(phase.startDate, 'MMM d')} - {format(phase.endDate, 'MMM d')}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{phase.progress}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPhaseColor(phase.colorIndex, index).split(' ')[0]}`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {activeDeliveries.map((delivery: any) => (
              <div
                key={delivery.id}
                className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">{delivery.product_name} Delivery</h3>
                    <p className="text-sm text-blue-700 mt-1">Project: {delivery.project_name}</p>
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    ETA: {format(delivery.etaDate, 'MMM d')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTimelineView = () => {
    const yearStart = startOfDay(new Date(currentDate.getFullYear(), 0, 1));
    const yearEnd = endOfDay(new Date(currentDate.getFullYear(), 11, 31));
    const totalDays = differenceInDays(yearEnd, yearStart) + 1;

    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(currentDate.getFullYear(), i, 1));
    }

    const showPhases = filterType === 'all' || filterType === 'phases';

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
        <div className="border-b border-gray-200 bg-white flex">
          <div className="w-48 p-4 border-r border-gray-200 font-medium text-sm text-gray-700 bg-white z-20 shrink-0">Phase</div>
          <div className="flex-1 overflow-x-auto relative">
            <div className="flex" style={{ minWidth: '100%' }}>
              {months.map(m => (
                <div
                  key={m.toString()}
                  className="flex-1 border-r border-gray-200 p-2 text-center text-xs font-semibold text-gray-500 min-w-[100px]"
                >
                  {format(m, 'MMM')}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {showPhases &&
            filteredPhases.map((phase: any, rowIdx: number) => {
              const startOffset = Math.max(0, differenceInDays(phase.startDate, yearStart));
              const endOffset = Math.min(totalDays, differenceInDays(phase.endDate, yearStart));
              const duration = endOffset - startOffset;

              const leftPct = (startOffset / totalDays) * 100;
              const widthPct = (duration / totalDays) * 100;

              if (widthPct <= 0 || leftPct >= 100) return null;

              return (
                <div key={phase.id} className="flex border-b border-gray-100 hover:bg-stone-50 transition-colors">
                  <div className="w-48 p-4 border-r border-gray-200 text-sm font-medium text-gray-900 truncate shrink-0">{phase.name}</div>
                  <div className="flex-1 relative h-14">
                    <div className="absolute inset-0 flex pointer-events-none">
                      {months.map(m => (
                        <div key={`grid-${m}`} className="flex-1 border-r border-gray-100 h-full min-w-[100px]" />
                      ))}
                    </div>
                    <div
                      className={`absolute top-3 h-8 rounded shadow-sm ${getPhaseColor(phase.colorIndex, rowIdx)} flex items-center px-2 text-white text-xs whitespace-nowrap overflow-hidden`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={`${phase.name}: ${format(phase.startDate, 'MMM d')} - ${format(phase.endDate, 'MMM d')}`}
                    >
                      {phase.name}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    if (mode === 'timeline') return renderTimelineView();
    if (view === 'week') return renderWeekView();
    if (view === 'day') return renderDayView();
    return renderMonthView();
  };

  return (
    <div className="">
      <div className="space-y-6">
        {/* Top Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white px-2 py-4 lg:py-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {/* <div className="bg-stone-100 p-1 rounded-lg border border-stone-200 flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setMode('calendar'); setView('month'); }}
                            className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${mode === 'calendar' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                        >
                            {t('calendar')}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setMode('timeline')}
                            className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${mode === 'timeline' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                        >
                            {t('timeline')}
                        </Button>
                    </div> */}

            {mode === 'calendar' && (
              <div className="flex items-center  border-gray-200">
                <div className="bg-stone-100 p-1 rounded-lg border border-stone-200 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('month')}
                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'month' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                  >
                    Month
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('week')}
                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'week' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                  >
                    Week
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('day')}
                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'day' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                  >
                    Day
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold w-32 text-center select-none">
                {mode === 'timeline' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleToday}>
              {t('today')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="h-9 lg:w-64 pl-9 bg-white border-gray-200"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={(v: 'all' | 'phases' | 'delivery_dates') => setFilterType(v)}>
              <SelectTrigger className=" lg:w-auto w-20  min-w-[162px] h-9 bg-stone-50 border-gray-200">
                <div className="flex items-center gap-1">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" className="" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="phases">Phases</SelectItem>
                <SelectItem value="delivery_dates">
                  Delivery <span className="hidden lg:inline">Dates</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex-col-reverse lg:flex-row flex gap-4 min-h-0 overflow-hidden">
          {/* Main Calendar Grid */}
          <div className="flex-1 h-full min-w-0">{renderCurrentView()}</div>

          {/* Sidebar (Day Details) - Only show in Month/Week view for context */}
          {mode === 'calendar' && view !== 'day' && (
            <div className="lg:w-80 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col shrink-0 h-full">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-lg">{format(selectedDate, 'EEEE, MMM do')}</h2>
                <p className="text-sm text-gray-500">
                  {(filterType === 'all' || filterType === 'phases') && `${phasesForSelectedDate.length} active phases`}
                  {filterType === 'all' && phasesForSelectedDate.length > 0 && deliveryDatesForSelectedDate.length > 0 && ', '}
                  {(filterType === 'all' || filterType === 'delivery_dates') &&
                    deliveryDatesForSelectedDate.length > 0 &&
                    `${deliveryDatesForSelectedDate.length} deliveries`}
                  {phasesForSelectedDate.length === 0 && deliveryDatesForSelectedDate.length === 0 && 'No events'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {((filterType === 'all' || filterType === 'phases') && phasesForSelectedDate.length > 0) ||
                ((filterType === 'all' || filterType === 'delivery_dates') && deliveryDatesForSelectedDate.length > 0) ? (
                  <>
                    {/* Phases */}
                    {(filterType === 'all' || filterType === 'phases') &&
                      phasesForSelectedDate.map((phase: any) => (
                        <div key={phase.id} className={`p-3 rounded-lg border ${getPhaseLightColor(phase.colorIndex)} border-opacity-20`}>
                          <h3 className={`font-medium text-sm`}>{phase.name}</h3>
                          <p className="text-xs opacity-80 mt-1 lines-clamp-2">{phase.description}</p>
                          <div className="mt-3 flex items-center justify-between text-xs font-medium opacity-70">
                            <span>{phase.progress}% done</span>
                            <span>{format(phase.endDate, 'MMM d')}</span>
                          </div>
                          <div className="w-full bg-white/50 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-current opacity-50" style={{ width: `${phase.progress}%` }} />
                          </div>
                        </div>
                      ))}

                    {/* Deliveries */}
                    {(filterType === 'all' || filterType === 'delivery_dates') &&
                      deliveryDatesForSelectedDate.map((delivery: any) => (
                        <div key={delivery.id} className="p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-sm text-blue-900">{delivery.product_name} Delivery</h3>
                              <p className="text-xs text-blue-700 mt-1">Project: {delivery.project_name}</p>
                            </div>
                          </div>
                          {/* <div className="mt-2 flex items-center text-xs font-medium text-blue-600">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    <span>ETA: {format(delivery.etaDate, 'h:mm a')}</span>
                                                </div> */}
                        </div>
                      ))}
                  </>
                ) : (
                  <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-200">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No active phases or deliveries for this date.</p>
                  </div>
                )}
              </div>
              {/* <div className="p-4 border-t border-gray-100 mt-auto">
                            <Button variant="outline" className="w-full justify-start text-gray-600" disabled>
                                <Plus className="w-4 h-4 mr-2"/> Add Note (Coming Soon)
                            </Button>
                        </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
