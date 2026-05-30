'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Search,
    Clock,
    Plus,
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
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import AddEventDialog from './AddEventDialog';
import { useTranslations } from 'next-intl';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export default function CalendarStudioPage() {
    const t = useTranslations('calendarStudioPage');

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [mode, setMode] = useState<'calendar' | 'timeline'>('calendar');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'phases' | 'delivery'>('all');

    // Fetch Phases and Delivery Dates
    const { data: phasesData, isLoading: phasesLoading } = useFetch('projects/studio-phases/');
    const { data: membersData, isLoading: membersLoading } = useFetch('projects/studio-members-phases/');
    const { data: deliveryDatesData, isLoading: deliveryLoading } = useFetch('projects/studio-delivery-dates/');


    // Parse phases
    const phases = useMemo(() => {
        if (!Array.isArray(phasesData)) return [];

        // First map and filter
        const parsed = phasesData.map((phase: any) => ({
            ...phase,
            // Parse as local date by taking just the YYYY-MM-DD part
            startDate: phase.start_date ? parseISO(phase.start_date.toString().substring(0, 10)) : null,
            endDate: phase.end_date ? parseISO(phase.end_date.toString().substring(0, 10)) : null,
        })).filter((p: any) => p.startDate && p.endDate);

        // Then assign sequential color index
        return parsed.map((p: any, i: number) => ({
            ...p,
            colorIndex: i
        }));
    }, [phasesData]);

    // Parse delivery dates
    const deliveryDates = useMemo(() => {
        if (!Array.isArray(deliveryDatesData)) return [];

        return deliveryDatesData.map((delivery: any, i: number) => ({
            ...delivery,
            // Parse ETA as local date
            deliveryDate: delivery.ETA ? parseISO(delivery.ETA.toString().substring(0, 10)) : null,
            colorIndex: i
        })).filter((d: any) => d.deliveryDate);
    }, [deliveryDatesData]);

    // Derived Data
    const filteredPhases = useMemo(() => {
        return phases.filter((p: any) =>
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.project_name && p.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [phases, searchQuery]);

    const phasesForSelectedDate = useMemo(() => {
        return filteredPhases.filter((p: any) =>
            isWithinInterval(selectedDate, { start: startOfDay(p.startDate), end: endOfDay(p.endDate) })
        );
    }, [filteredPhases, selectedDate]);

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

        // In week view, filtering just by range might miss items spanning ACROSS the week but starting/ending outside
        // But the logic below (startDate <= end AND endDate >= start) handles spans correctly.
        const phasesInRange = filteredPhases.filter((p: any) =>
            (p.startDate <= endOfDay(end) && p.endDate >= startOfDay(start))
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

            <div className="flex animate-in fade-in slide-in-from-bottom-2 duration-200 flex-col h-full border border-gray-200 rounded-lg overflow-y-scroll bg-white shadow-sm">
                {/* Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
                    {WEEKDAY_KEYS.map((d) => (
                        <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {t(`weekdays.${d}`)}
                        </div>
                    ))}
                </div>

                <div className="flex-1 flex flex-col">
                    {weeks.map((weekDays, weekIdx) => {
                        const weekStart = weekDays[0];
                        const weekEnd = weekDays[weekDays.length - 1];

                        // Get rows for this specific week row
                        const allRows = getLayoutRows(phasesInRange, weekStart, weekEnd);
                        let visibleRows = allRows.slice(0, 3);

                        if (filterType === 'delivery') {
                            visibleRows = [];
                        }

                        const hiddenPhases = allRows.slice(3).flat();

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
                                                ${!isCurrentMonth && isMonthView ? 'bg-stone-50/30' : 'bg-white'}
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

                                                {/* Delivery Dates Pills */}
                                                {(filterType === 'all' || filterType === 'delivery') && (
                                                    <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-1 z-20 pointer-events-none">
                                                        {deliveryDates
                                                            .filter((del: any) => isSameDay(del.deliveryDate, d))
                                                            .map((del: any) => (
                                                                <TooltipProvider key={del.id}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="bg-purple-100 border border-purple-200 text-purple-700 text-[11px] px-1 py-1 rounded-[12px] truncate pointer-events-auto text-center">
                                                                                {del.product_name}
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="font-semibold">{del.project_name}</p>
                                                                            <p>{del.product_name}</p>
                                                                            <p className="text-xs text-gray-500">ETA: {format(del.deliveryDate, 'MMM d')}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            ))}
                                                    </div>
                                                )}
                                                {(() => {
                                                    const hiddenCount = hiddenPhases.filter((p: any) =>
                                                        (p.startDate <= endOfDay(d) && p.endDate >= startOfDay(d))
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
                                            {rowItems.map((phase: any) => {
                                                const phaseStartDay = phase.startDate < weekStart ? weekStart : phase.startDate;
                                                // If week is partial (e.g. end of month), ensure we don't overflow
                                                const phaseEndDay = phase.endDate > weekEnd ? weekEnd : phase.endDate;

                                                const startOffset = differenceInDays(phaseStartDay, weekStart);
                                                const duration = differenceInDays(phaseEndDay, phaseStartDay) + 1;

                                                // Only render if visible in this week row
                                                if (startOffset < 0 && (startOffset + duration) <= 0) return null;

                                                return (
                                                    <TooltipProvider key={phase.id}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={`
                                                                    absolute h-7  rounded-[12px] px-3 flex items-center truncate text-white pointer-events-auto cursor-pointer  transition-all hover:opacity-90 hover:scale-[1.01]
                                                                    ${getPhaseColor(phase.colorIndex, rowIdx)}
                                                                `}
                                                                    style={{
                                                                        left: `${(startOffset / 7) * 100}%`,
                                                                        width: `calc(${(duration / 7) * 100}% - 0px)`,
                                                                        marginLeft: '0px',
                                                                        marginRight: '0px',
                                                                    }}
                                                                >
                                                                    {(phase.startDate >= weekStart || weekIdx === 0) && `${phase.project_name} - ${phase.name}`}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="font-semibold">{phase.project_name}</div>
                                                                <div className="text-sm">{phase.name}</div>
                                                                <div className="text-xs text-gray-500">{format(phase.startDate, 'MMM d')} - {format(phase.endDate, 'MMM d')}</div>
                                                                <div className="text-xs mt-1">{t('progress')}: {phase.progress}%</div>
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
        const dayStart = startOfDay(currentDate);
        const dayEnd = endOfDay(currentDate);

        const activePhases = phases.filter((p: any) =>
            isWithinInterval(currentDate, { start: startOfDay(p.startDate), end: endOfDay(p.endDate) })
        );


        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{format(currentDate, 'EEEE')}</h2>
                        <p className="text-gray-500">{format(currentDate, 'MMMM do, yyyy')}</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                        {t('activePhaseCount', { count: activePhases.length })}
                    </Badge>
                </div>

                {activePhases.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p>No phases scheduled for this day.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activePhases.map((phase: any, index: number) => (
                            <div key={phase.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:bg-white hover:shadow-sm transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{phase.project_name} - {phase.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">{phase.description}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium  bg-opacity-0`}>
                                        {format(phase.startDate, 'MMM d')} - {format(phase.endDate, 'MMM d')}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>{t('progress')}</span>
                                        <span>{phase.progress}%</span>
                                    </div>
                                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${getPhaseColor(phase.colorIndex, index).split(' ')[0]}`} style={{ width: `${phase.progress}%` }} />
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
        const now = new Date();
        // 1. Determine Timeline Range & Columns based on 'view' (Granularity)
        // view='day' -> Granularity: Day, Range: Month
        // view='week' -> Granularity: Week, Range: Year
        // view='month' -> Granularity: Month, Range: Year

        let rangeStart: Date, rangeEnd: Date, columns: { label: React.ReactNode, date: Date, width: number }[] = [];
        let daysPerCol = 1;

        if (view === 'day') {
            // DAY GRANULARITY (Show Month)
            rangeStart = startOfMonth(currentDate);
            rangeEnd = endOfMonth(currentDate);
            const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
            columns = days.map(d => ({
                label: (
                    <div className="flex flex-col items-center justify-center p-1">
                        <span className="text-[10px] text-gray-500 font-medium uppercase">{format(d, 'EEE')}</span>
                        <span className="text-lg font-bold text-gray-700 -mt-0.5">{format(d, 'd')}</span>
                    </div>
                ),
                date: d,
                width: 48
            }));
            daysPerCol = 1;
        } else if (view === 'week') {
            // WEEK GRANULARITY (Show Weeks of Current Month)
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);

            // Get the first day of the first week that includes the month start
            rangeStart = startOfWeek(monthStart);
            // Get the last day of the last week that includes the month end
            rangeEnd = endOfWeek(monthEnd);

            // Generate week columns
            let weekNumber = 1;
            let iter = rangeStart;

            while (iter <= rangeEnd) {
                const weekEnd = endOfWeek(iter);
                columns.push({
                    label: (
                        <div className="flex flex-col items-center justify-center text-xs">
                            <span className="font-semibold text-gray-600">Week {weekNumber}</span>
                            <span className="text-[10px] text-gray-400">{format(iter, 'MMM d')}</span>
                        </div>
                    ),
                    date: iter,
                    width: 180 // wider for week view
                });
                iter = addWeeks(iter, 1);
                weekNumber++;
            }
            daysPerCol = 7;

        } else {
            // MONTH GRANULARITY (Show Year)
            rangeStart = startOfDay(new Date(currentDate.getFullYear(), 0, 1));
            rangeEnd = endOfDay(new Date(currentDate.getFullYear(), 11, 31));

            for (let i = 0; i < 12; i++) {
                const d = new Date(currentDate.getFullYear(), i, 1);
                columns.push({
                    label: (
                        <span className="text-sm font-semibold text-gray-600">{format(d, 'MMMM')}</span>
                    ),
                    date: d,
                    width: 120
                });
            }
            daysPerCol = 30.44; // Approx
        }

        // Total Grid Width
        const totalGridWidth = columns.reduce((sum, col) => sum + col.width, 0);

        // 2. Process Members Data
        const members = (membersData || []).map((m: any) => {
            // 2a. Filter/Map Phases
            const validPhases: any[] = [];
            (m.projects || []).forEach((proj: any) => {
                (proj.phases || []).forEach((ph: any) => {
                    const pName = ph.name?.toLowerCase() || '';
                    const projName = proj.project_name?.toLowerCase() || '';
                    const query = searchQuery.toLowerCase();
                    // Search Filter
                    if (searchQuery && !pName.includes(query) && !projName.includes(query)) return;

                    const pStart = ph?.start_date ? parseISO(ph?.start_date) : null;
                    const pEnd = ph?.end_date ? parseISO(ph?.end_date) : null;
                    if (!pStart || !pEnd) return;

                    validPhases.push({
                        ...ph,
                        startDate: pStart,
                        endDate: endOfDay(pEnd),
                        project_name: proj.project_name,
                        project_id: proj.id
                    });
                });
            });

            // 2b. Calculate Layout Rows
            // Only consider phases that intersect with the current visible range
            const phasesInRange = validPhases.filter(p =>
                (p.startDate <= rangeEnd && p.endDate >= rangeStart)
            );

            // Pass 'view' as granularity to ensure proper stacking in Month/Week buckets
            const layoutRows = getLayoutRows(phasesInRange, rangeStart, rangeEnd, view);

            if (phasesInRange.length === 0 && searchQuery) return null;

            return { ...m, layoutRows };
        }).filter(Boolean);

        // Styling Constants
        const ROW_HEIGHT = 28;
        const ROW_GAP = 6;
        const MEMBER_COL_WIDTH = 260; // Fixed width for sticky sidebar

        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col  h-full overflow-hidden">
                {/* Unified Scroll Container */}
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar relative">
                    <div style={{ minWidth: `${totalGridWidth + MEMBER_COL_WIDTH}px` }}>

                        {/* Sticky Header Group */}
                        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex h-14 shadow-sm">
                            {/* Sticky Top-Left Corner */}
                            <div
                                className="sticky left-0 z-50 bg-white border-r border-gray-200 flex items-center px-4 font-semibold text-sm text-gray-700 shadow-sm"
                                style={{ width: `${MEMBER_COL_WIDTH}px`, minWidth: `${MEMBER_COL_WIDTH}px` }}
                            >
                                Studio Members
                            </div>
                            {/* Scrollable Date Header */}
                            <div className="flex w-fit">
                                {columns.map((col, i) => {
                                    let isCurrent = false;
                                    if (view === 'day') isCurrent = isSameDay(col.date, now);
                                    else if (view === 'week') isCurrent = isSameWeek(col.date, now);
                                    else isCurrent = isSameMonth(col.date, now);

                                    return (
                                        <div
                                            key={i}
                                            className={`border-r border-gray-100 flex items-center justify-center ${isCurrent ? 'bg-[#fffaf3]' : 'bg-stone-50'}`}
                                            style={{ width: col.width }}
                                        >
                                            {col.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Member Rows */}
                        {members.map((member: any) => {
                            const rowCount = Math.max(member.layoutRows.length, 1);
                            const contentHeight = (rowCount * (ROW_HEIGHT + ROW_GAP)) - ROW_GAP; // visual height of bars
                            const rowMinHeight = 64;
                            const totalRowHeight = Math.max(contentHeight + 24, rowMinHeight); // padding 12px top/bot

                            return (
                                <div key={member.id} className="flex border-b border-gray-100 group hover:bg-stone-50/50 transition-colors">
                                    {/* Sticky Left Sidebar (Member Info) */}
                                    <div
                                        className="sticky left-0 z-30 bg-white border-r border-gray-200 px-4 flex items-center gap-3 transition-colors group-hover:bg-stone-50"
                                        style={{ width: `${MEMBER_COL_WIDTH}px`, minWidth: `${MEMBER_COL_WIDTH}px`, height: `${totalRowHeight}px` }}
                                    >
                                        {/* <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-blue-100">
                                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                    </div> */}
                                        <Avatar className='flex-shrink-0 w-9 h-9 rounded-full'>
                                            <AvatarFallback className='flex-shrink-0'>{member.name ? member?.name?.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 overflow-hidden">
                                            <div className="text-sm font-semibold text-gray-900 truncate">{member.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{member.title || 'Team Member'}</div>
                                        </div>
                                    </div>

                                    {/* Timeline Content Area */}
                                    <div className="relative flex-1" style={{ height: `${totalRowHeight}px` }}>
                                        {/* Vertical Grid Lines */}
                                        <div className="absolute inset-0 flex pointer-events-none z-0 w-fit">
                                            {columns.map((col, i) => {
                                                let isCurrent = false;
                                                if (view === 'day') isCurrent = isSameDay(col.date, now);
                                                else if (view === 'week') isCurrent = isSameWeek(col.date, now);
                                                else isCurrent = isSameMonth(col.date, now);

                                                return (
                                                    <div key={i} className={`border-r border-gray-100 h-full flex-shrink-0 ${isCurrent ? 'bg-[#fffaf3]' : ''}`} style={{ width: col.width }} />
                                                );
                                            })}
                                        </div>

                                        {/* Render Phases Bars */}
                                        <div className="absolute inset-0 top-3 w-full">
                                            {member.layoutRows.map((rowItems: any[], rKey: number) => (
                                                <React.Fragment key={rKey}>
                                                    {rowItems.map((phase: any) => {
                                                        // Precise Position Calculation with Clipping
                                                        let leftPx = 0, widthPx = 0;
                                                        let isClippedStart = false;
                                                        let isClippedEnd = false;

                                                        if (view === 'month') {
                                                            // MONTH GRANULARITY: Calculate based on month spans
                                                            const phaseStartYear = phase.startDate.getFullYear();
                                                            const phaseStartMonth = phase.startDate.getMonth();
                                                            const phaseEndYear = phase.endDate.getFullYear();
                                                            const phaseEndMonth = phase.endDate.getMonth();

                                                            const rangeYear = rangeStart.getFullYear();
                                                            const rangeEndYear = rangeEnd.getFullYear();
                                                            const rangeEndMonth = rangeEnd.getMonth();

                                                            // Calculate month offset from start of range (Jan = 0)
                                                            let startMonthOffset = (phaseStartYear - rangeYear) * 12 + phaseStartMonth;
                                                            let endMonthOffset = (phaseEndYear - rangeYear) * 12 + phaseEndMonth;

                                                            // Clip to visible range
                                                            if (startMonthOffset < 0) {
                                                                startMonthOffset = 0;
                                                                isClippedStart = true;
                                                            }

                                                            const lastVisibleMonth = (rangeEndYear - rangeYear) * 12 + rangeEndMonth;
                                                            if (endMonthOffset > lastVisibleMonth) {
                                                                endMonthOffset = lastVisibleMonth;
                                                                isClippedEnd = true;
                                                            }

                                                            // Number of month columns this phase spans (inclusive) in visible range
                                                            const monthSpan = endMonthOffset - startMonthOffset + 1;

                                                            const colWidth = columns[0]?.width || 120;
                                                            leftPx = startMonthOffset * colWidth;
                                                            widthPx = monthSpan * colWidth;

                                                        } else {
                                                            // DAY/WEEK GRANULARITY: Use day-based calculation
                                                            const phaseVisibleStart = phase.startDate < rangeStart ? rangeStart : phase.startDate;
                                                            const phaseVisibleEnd = phase.endDate > rangeEnd ? rangeEnd : phase.endDate;

                                                            isClippedStart = phase.startDate < rangeStart;
                                                            isClippedEnd = phase.endDate > rangeEnd;

                                                            let diffDaysStart = differenceInDays(phaseVisibleStart, rangeStart);
                                                            let durationDays = differenceInDays(phaseVisibleEnd, phaseVisibleStart) + 1;

                                                            const colWidth = columns[0]?.width || 48;
                                                            leftPx = (diffDaysStart / daysPerCol) * colWidth;
                                                            widthPx = (durationDays / daysPerCol) * colWidth;
                                                        }

                                                        return (
                                                            <TooltipProvider key={`${phase.id}-${rKey}`}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div
                                                                            className={`absolute rounded-[12px] px-2 text-[10px] font-medium flex items-center text-white cursor-pointer shadow-sm  transition-all hover:opacity-90 hover:scale-[1.01] ${getPhaseColor(phase.id, rKey)}`}
                                                                            style={{
                                                                                left: `${leftPx}px`,
                                                                                width: `${Math.max(widthPx, 24)}px`,
                                                                                height: `${ROW_HEIGHT}px`,
                                                                                top: `${rKey * (ROW_HEIGHT + ROW_GAP)}px`,
                                                                                zIndex: 10 + rKey
                                                                            }}
                                                                        >
                                                                            <span className="truncate text-xs">
                                                                                {phase.project_name} - {phase.name}
                                                                            </span>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="z-50">
                                                                        <div className="font-bold">{phase.project_name}</div>
                                                                        <div className="text-sm">{phase.name}</div>
                                                                        <div className="text-xs opacity-70 mt-1">
                                                                            {format(phase.startDate, 'MMM d, yyyy')} - {format(phase.endDate, 'MMM d, yyyy')}
                                                                        </div>
                                                                        <div className="text-xs mt-1">{t('progress')}: {phase.progress}%</div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {members.length === 0 && (
                            <div className="p-12 text-center text-gray-400 bg-stone-50/50">
                                {t('noMembers')}
                            </div>
                        )}
                    </div>
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
        <div className="flex-1 bg-stone-50 p-6 flex flex-col overflow-hidden">
            <div className="max-w-7xl w-full mx-auto flex flex-col h-full gap-4">
                {/* Top Toolbar */}
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-stone-100 p-1 rounded-lg border border-stone-200 flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setMode('calendar'); setView('month'); }}
                                className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${mode === 'calendar' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                            >
                                {t('modes.calendar')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode('timeline')}
                                className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${mode === 'timeline' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                            >
                                {t('modes.timeline')}
                            </Button>
                        </div>

                        {/* View Buttons - Visible for both Calendar and Timeline */}
                        <div className="flex items-center  border-gray-200">
                            <div className="bg-stone-100 p-1 rounded-lg border border-stone-200 flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('month')}
                                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'month' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                                >
                                    {t('views.month')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('week')}
                                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'week' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                                >
                                    {t('views.week')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('day')}
                                    className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'day' ? 'bg-stone-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'}`}
                                >
                                    {t('views.day')}
                                </Button>
                            </div>
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
                        {/* <Button variant="outline" size="sm" onClick={handleToday}>
                            Today
                        </Button> */}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="h-9 w-64 pl-9 bg-white border-gray-200"
                                placeholder={t('searchPhases')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                            <SelectTrigger className="w-[140px] h-9 bg-white border-gray-200">
                                <SelectValue placeholder={t('filters.filter')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.all')}</SelectItem>
                                <SelectItem value="phases">{t('filters.phases')}</SelectItem>
                                <SelectItem value="delivery">{t('filters.deliveryDate')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <AddEventDialog />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                    {/* Main Calendar Grid */}
                    <div className="flex-1 h-full min-w-0">
                        {renderCurrentView()}
                    </div>

                    {/* Sidebar (Day Details) - Only show in Month/Week view for context */}
                    {/* Sidebar (Day Details) - Only show in Month/Week view for context */}
                    {mode === 'calendar' && view !== 'day' && (
                        <div className="w-80 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col shrink-0 h-full">
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="font-semibold text-lg">{format(selectedDate, 'EEEE, MMM do')}</h2>
                                <div className="flex gap-2 text-sm text-gray-500">
                                    {(filterType === 'all' || filterType === 'phases') && (
                                        <span>{phasesForSelectedDate.length} Phases</span>
                                    )}
                                    {(filterType === 'all' || filterType === 'delivery') && (
                                        <span>• {deliveryDates.filter((d: any) => isSameDay(d.deliveryDate, selectedDate)).length} Deliveries</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Phases Section */}
                                {(filterType === 'all' || filterType === 'phases') && phasesForSelectedDate.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('activePhases')}</h3>
                                        {phasesForSelectedDate.map((phase: any) => (
                                            <div key={phase.id} className={`p-3 rounded-lg border ${getPhaseLightColor(phase.colorIndex)} border-opacity-20`}>
                                                <h3 className={`font-medium text-sm`}>{phase.project_name}</h3>
                                                <p className="text-xs opacity-80 mt-1 lines-clamp-2">{phase.name}</p>
                                                <div className="mt-2 flex items-center justify-between text-xs font-medium opacity-70">
                                                    <span>{phase.progress}% Done</span>
                                                    <span>{format(phase.endDate, 'MMM d')}</span>
                                                </div>
                                                <div className="w-full bg-white/50 h-1.5 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-current opacity-50" style={{ width: `${phase.progress}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Delivery Dates Section */}
                                {(filterType === 'all' || filterType === 'delivery') && deliveryDates.filter((d: any) => isSameDay(d.deliveryDate, selectedDate)).length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliveries</h3>
                                        {deliveryDates
                                            .filter((d: any) => isSameDay(d.deliveryDate, selectedDate))
                                            .map((del: any) => (
                                                <div key={del.id} className="p-3 rounded-lg border border-purple-100 bg-purple-50">
                                                    <h3 className="font-medium text-sm text-purple-900">{del.project_name}</h3>
                                                    <p className="text-xs text-purple-700 mt-1">{del.product_name}</p>
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-purple-600">
                                                        <Clock className="w-3 h-3" />
                                                        <span>ETA: {format(del.deliveryDate, 'MMM d, yyyy')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {((filterType === 'phases' && phasesForSelectedDate.length === 0) ||
                                    (filterType === 'delivery' && deliveryDates.filter((d: any) => isSameDay(d.deliveryDate, selectedDate)).length === 0) ||
                                    (filterType === 'all' && phasesForSelectedDate.length === 0 && deliveryDates.filter((d: any) => isSameDay(d.deliveryDate, selectedDate)).length === 0)) && (
                                        <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-200">
                                            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">{t('noEventsDate')}</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
