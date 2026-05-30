'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Filter,
    Plus,
    Search,
    Clock,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useFetch from '@/hooks/useFetch';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isSameWeek,
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
    subYears
} from 'date-fns';
import { useTranslations } from 'next-intl';

export default function CalendarStudioPage() {
    const t = useTranslations('homeCalendarPage');
    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [mode, setMode] = useState<'calendar' | 'timeline'>('calendar');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Tasks
    const { data: taskData, isLoading: taskLoading } = useFetch('task/user-task-summary/');


    // Parse tasks
    const tasks = useMemo(() => {
        if (!Array.isArray(taskData)) return [];

        // First map and filter
        const parsed = taskData.map((task: any) => ({
            ...task,
            name: task.title, // Mapping title to name for consistency with rendering logic if needed, but we'll use title primarily
            // Parse as local date by taking just the YYYY-MM-DD part
            startDate: task.start_date ? parseISO(task.start_date.toString().substring(0, 10)) : null,
            endDate: task.end_date ? parseISO(task.end_date.toString().substring(0, 10)) : null,
        })).filter((t: any) => t.startDate && t.endDate);

        return parsed;
    }, [taskData]);

    // Derived Data
    const filteredTasks = useMemo(() => {
        return tasks.filter((t: any) =>
            !searchQuery ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.project_name && t.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [tasks, searchQuery]);

    const tasksForSelectedDate = useMemo(() => {
        return filteredTasks.filter((t: any) =>
            isWithinInterval(selectedDate, { start: startOfDay(t.startDate), end: endOfDay(t.endDate) })
        );
    }, [filteredTasks, selectedDate]);

    // Handlers
    const handlePrev = () => {
        if (mode === 'timeline') {
            if (view === 'day') setCurrentDate(subMonths(currentDate, 1));
            else if (view === 'week') setCurrentDate(subMonths(currentDate, 1));
            else setCurrentDate(subYears(currentDate, 1));
            return;
        }
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        if (view === 'day') setCurrentDate(addDays(currentDate, -1));
    };

    const handleNext = () => {
        if (mode === 'timeline') {
            if (view === 'day') setCurrentDate(addMonths(currentDate, 1));
            else if (view === 'week') setCurrentDate(addMonths(currentDate, 1));
            else setCurrentDate(addYears(currentDate, 1));
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
    const getLayoutRows = (items: any[], rangeStart: Date, rangeEnd: Date, granularity: 'day' | 'week' | 'month' = 'day') => {
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
                    let existingStart = existing.startDate < rangeStart ? rangeStart : existing.startDate;
                    let existingEnd = existing.endDate > rangeEnd ? rangeEnd : existing.endDate;

                    let checkItemStart = itemStart;
                    let checkItemEnd = itemEnd;

                    if (granularity === 'month') {
                        existingStart = startOfMonth(existingStart);
                        existingEnd = endOfMonth(existingEnd);
                        checkItemStart = startOfMonth(checkItemStart);
                        checkItemEnd = endOfMonth(checkItemEnd);
                    } else if (granularity === 'week') {
                        existingStart = startOfWeek(existingStart);
                        existingEnd = endOfWeek(existingEnd);
                        checkItemStart = startOfWeek(checkItemStart);
                        checkItemEnd = endOfWeek(checkItemEnd);
                    }

                    return (checkItemStart <= existingEnd && checkItemEnd >= existingStart);
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

    // Helper for status configuration (Colors & Labels)
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'D': // Done
                return {
                    label: t('status.done'),
                    className: 'bg-[#8fa58f] text-[#3a4b3a] border-[#8fa58f]',
                    barClassName: 'bg-[#8fa58f] border-[#8fa58f] !text-[#3a4b3a]'
                };
            case 'IR': // In Review
                return {
                    label: t('status.inReview'),
                    className: 'bg-[#d9d5cc] text-[#5c5750] border-[#d9d5cc]',
                    barClassName: 'bg-[#d9d5cc] border-[#d9d5cc] !text-[#5c5750]'
                };
            case 'TD': // Todo
                return {
                    label: t('status.todo'),
                    className: 'bg-[#e07a57] text-[#e7e7e7] border-[#e07a57]',
                    barClassName: 'bg-[#e07a57] border-[#e07a57] !text-[#e7e7e7]'
                };
            case 'IP': // In Progress
                return {
                    label: t('status.inProgress'),
                    className: 'bg-[#111827] text-white border-[#111827]',
                    barClassName: 'bg-[#111827] border-[#111827] !text-white'
                };
            default:
                return {
                    label: status,
                    className: 'bg-stone-200 text-gray-700 border-gray-200',
                    barClassName: 'bg-stone-200 border-gray-200 text-gray-700'
                };
        }
    };

    const getPriorityLabel = (priority: string) => {
        const map: Record<string, string> = {
            'L': t('priority.low'),
            'M': t('priority.medium'),
            'H': t('priority.high')
        };
        return map[priority] || priority;
    };

    const weekdayLabels = [
        t('weekdays.sun'),
        t('weekdays.mon'),
        t('weekdays.tue'),
        t('weekdays.wed'),
        t('weekdays.thu'),
        t('weekdays.fri'),
        t('weekdays.sat'),
    ];


    // -- VIEWS --

    const renderGrid = (days: Date[], isMonthView: boolean) => {
        const start = days[0];
        const end = days[days.length - 1];

        // In week view, filtering just by range might miss items spanning ACROSS the week but starting/ending outside
        // But the logic below (startDate <= end AND endDate >= start) handles spans correctly.
        const tasksInRange = filteredTasks.filter((t: any) =>
            (t.startDate <= endOfDay(end) && t.endDate >= startOfDay(start))
        );

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

            <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-y-scroll bg-white ">
                {/* Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
                    {weekdayLabels.map((d) => (
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
                        const allRows = getLayoutRows(tasksInRange, weekStart, weekEnd);
                        const visibleRows = allRows.slice(0, 3);
                        const hiddenTasks = allRows.slice(3).flat();

                        return (
                            <div key={weekIdx} className={`flex-1 border-b  border-gray-100 relative group ${isMonthView ? 'min-h-[100px]' : 'min-h-[400px]'}`}>
                                {/* Background Grid */}
                                <div className="absolute inset-0  grid grid-cols-7 z-0 pointer-events-none">
                                    {weekDays.map((d) => {
                                        const isToday = isSameDay(d, new Date());
                                        const isCurrentMonth = isSameMonth(d, currentDate);
                                        const isSelected = isSameDay(d, selectedDate);

                                        return (
                                            <div
                                                key={d.toISOString()}
                                                className={`
                                                border-r relative  border-gray-100 h-full p-2 transition-colors pointer-events-auto cursor-pointer
                                                ${!isCurrentMonth && isMonthView ? 'bg-white/30' : 'bg-white'}
                                                ${isSelected ? '!bg-[#fffaf3]' : 'hover:bg-stone-50'}
                                            `}
                                                onClick={() => setSelectedDate(d)}
                                            >
                                                <div className="flex justify-center">
                                                    <span
                                                        className={`
                                                        text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full
                                                        ${isToday ? 'bg-gray-900 text-white' : (isCurrentMonth || !isMonthView ? 'text-gray-700' : 'text-gray-400')}
                                                    `}
                                                    >
                                                        {format(d, 'd')}
                                                    </span>
                                                </div>
                                                {(() => {
                                                    const hiddenCount = hiddenTasks.filter((t: any) =>
                                                        (t.startDate <= endOfDay(d) && t.endDate >= startOfDay(d))
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
                                            {rowItems.map((task: any) => {
                                                const taskStartDay = task.startDate < weekStart ? weekStart : task.startDate;
                                                // If week is partial (e.g. end of month), ensure we don't overflow
                                                const taskEndDay = task.endDate > weekEnd ? weekEnd : task.endDate;

                                                const startOffset = differenceInDays(taskStartDay, weekStart);
                                                const duration = differenceInDays(taskEndDay, taskStartDay) + 1;

                                                // Only render if visible in this week row
                                                if (startOffset < 0 && (startOffset + duration) <= 0) return null;

                                                // Get dynamic style config based on status
                                                const styleConfig = getStatusConfig(task.status);

                                                return (
                                                    <TooltipProvider key={task.id}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={`
                                                                    absolute h-7  rounded-[12px] px-3 flex items-center truncate text-white pointer-events-auto cursor-pointer  transition-all hover:opacity-90 hover:scale-[1.01]
                                                                    ${styleConfig.barClassName}
                                                                `}
                                                                    style={{
                                                                        left: `${(startOffset / 7) * 100}%`,
                                                                        width: `calc(${(duration / 7) * 100}% - 0px)`,
                                                                        marginLeft: '0px',
                                                                        marginRight: '0px',
                                                                    }}
                                                                >
                                                                    {(task.startDate >= weekStart || weekIdx === 0) && `${task.project_name} - ${task.title}`}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="font-semibold">{task.project_name}</div>
                                                                <div className="text-sm">{task.title}</div>
                                                                <div className="text-xs text-gray-500">{format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}</div>
                                                                <div className="text-xs mt-1">Status: {styleConfig.label}</div>
                                                                {task.priority && <div className="text-xs mt-1">Priority: {getPriorityLabel(task.priority)}</div>}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                );
                                            })}
                                        </div>
                                    ))}
                                    <div className='relative h-6 mb-1 w-full text-xs'>

                                    </div>
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
        const activeTasks = tasks.filter((t: any) =>
            isWithinInterval(currentDate, { start: startOfDay(t.startDate), end: endOfDay(t.endDate) })
        );


        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{format(currentDate, 'EEEE')}</h2>
                        <p className="text-gray-500">{format(currentDate, 'MMMM do, yyyy')}</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                        {activeTasks.length === 1 ? t('activeTasks', { count: activeTasks.length }) : t('activeTasksPlural', { count: activeTasks.length })}
                    </Badge>
                </div>

                {activeTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p>{t('noTasksDay')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeTasks.map((task: any, index: number) => {
                            // Get dynamic style config based on status
                            const styleConfig = getStatusConfig(task.status);
                            return (
                                <div key={task.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{task.project_name} - {task.title}</h3>
                                            {/* <p className="text-sm text-gray-500 mt-1 max-w-2xl">{task.description}</p> */}
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium  bg-opacity-0`}>
                                            {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <div className="flex gap-2">
                                                <span>{t('statusLabel')} <span className={`font-semibold ml-1 ${styleConfig.textClassName || ''}`}>{styleConfig.label}</span></span>
                                                {task.priority && <span>| {t('priorityLabel')} {getPriorityLabel(task.priority)}</span>}
                                            </div>
                                        </div>
                                        {/* <div className={`mt-2 px-2 py-1 inline-block rounded text-xs font-medium ${styleConfig.className} bg-opacity-20`}>
                                             {styleConfig.label}
                                         </div> */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };


    const renderCurrentView = () => {
        if (view === 'week') return renderWeekView();
        if (view === 'day') return renderDayView();
        return renderMonthView();
    };

    return (
        <div className="flex-1 bg-stone-50 p-6 flex flex-col overflow-hidden">
            <div className="max-w-7xl w-full mx-auto flex flex-col h-full gap-6">
                {/* <HomeNav /> */}
                {/* Top Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white py-4 lg:py-2 px-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
                    {/* <div className="flex items-center gap-4">
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
                    </div> */}
                    
                    <div className="flex items-center border-gray-200">
  <div className="bg-stone-100 p-1 rounded-lg flex items-center gap-1 relative border border-stone-200">
    
    {["month", "week", "day"].map((type) => (
      <button
        key={type}
        onClick={() => setView(type)}
        className="relative h-8 px-3 rounded-md text-xs font-medium"
      >
        {view === type && (
          <motion.div
            layoutId="activeView"
            className="absolute inset-0 bg-white rounded-md shadow-sm"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        <span
          className={`relative z-10 ${
            view === type
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </button>
    ))}
  </div>
</div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold w-32 text-center select-none">
                                {mode === 'timeline'
                                    ? (view === 'day' ? format(currentDate, 'MMMM yyyy')
                                        : view === 'week' ? format(currentDate, 'MMMM yyyy')
                                            : format(currentDate, 'yyyy'))
                                    : format(currentDate, 'MMMM yyyy')}
                            </span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleToday}>
                            Today
                        </Button>
                    </div>

                    <div className="flex w-full lg:w-auto items-center gap-2">
                        <div className="relative w-full lg:w-auto">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="h-9 w-full lg:w-64 pl-9 bg-white border-gray-200"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex lg:flex-row flex-col-reverse gap-4 min-h-0 overflow-hidden">
                    {/* Main Calendar Grid */}
                    <div className="flex-1 h-full min-w-0">
                        {renderCurrentView()}
                        {/* Legend */}
                        <div className="bg-white shadow-sm p-3 rounded-xl mt-5 border border-gray-200 shadow-sm flex items-center gap-6 text-xs text-gray-600">
                            {/* <span className="font-semibold text-gray-900">Legend:</span> */}
                            {['D', 'IR', 'TD', 'IP'].map((status) => {
                                const config = getStatusConfig(status);
                                return (
                                    <div key={status} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${config.barClassName.replace('!text-[#3a4b3a]', '').replace('!text-[#5c5750]', '').replace('!text-[#e7e7e7]', '').replace('!text-white', '').split(' ')[0]}`}></div>
                                        <span>{config.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar (Day Details) - Only show in Month/Week view for context */}
                    {view !== 'day' && (
                        <div className="lg:w-80 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col shrink-0 h-full">
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="font-semibold text-lg">{format(selectedDate, 'EEEE, MMM do')}</h2>
                                <p className="text-sm text-gray-500">
                                    {t('activeTasksSidebar', { count: tasksForSelectedDate.length })}
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {tasksForSelectedDate.length === 0 ? (
                                    <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-200">
                                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">{t('noTasksDate')}</p>
                                    </div>
                                ) : (
                                    tasksForSelectedDate.map((task: any) => {
                                        // Get dynamic style config based on status
                                        const styleConfig = getStatusConfig(task.status);
                                        return (
                                            <div key={task.id} className={`p-3 rounded-lg border ${styleConfig.className} border-opacity-20`}>
                                                <h3 className={`font-medium text-sm`}>{task.project_name}</h3>
                                                <p className="text-xs opacity-80 mt-1 lines-clamp-2">{task.title}</p>
                                                <div className="mt-2 flex items-center justify-between text-xs font-medium opacity-70">
                                                    <span>{t('statusLabel')} {styleConfig.label}</span>
                                                    <span>{format(task.endDate, 'MMM d')}</span>
                                                </div>
                                                {task.priority && (
                                                    <div className="mt-1 text-xs opacity-70">
                                                        {t('priorityLabel')} {getPriorityLabel(task.priority)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}


                </div>



            </div>
        </div>
    );
}
