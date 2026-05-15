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
    Loader2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useFetch from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
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
} from 'date-fns';
import AddEventDialog from './studio/AddEventDialog';
import Link from 'next/link';

export default function UnifiedCalendarPage() {

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'phases' | 'delivery'>('all');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [showMyCalendar, setShowMyCalendar] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const queryClient = useQueryClient();
    const { refetch: getCalendarAuthUrl } = useFetch('gmail/connect/', { enabled: false });

    const handleGoogleCalendarConnect = async () => {
        setIsConnecting(true);
        const { data: responseData } = await getCalendarAuthUrl();
        const authUrl = typeof responseData === 'string' ? responseData : (responseData as any)?.auth_url;
        if (!authUrl) { setIsConnecting(false); return; }
        const popup = window.open(authUrl, 'GmailAuth', 'width=600,height=700');
        if (!popup) { setIsConnecting(false); return; }
        const cleanup = () => {
            setIsConnecting(false);
            queryClient.refetchQueries({ queryKey: ['gmail/calendar/events/'] });
            clearInterval(popupCheck);
            window.removeEventListener('message', handleMsg);
            popup?.close();
        };
        const handleMsg = (e: MessageEvent) => {
            if (e.origin !== window.location.origin) return;
            if (e.data?.type === 'OAUTH_SUCCESS') { cleanup(); }
        };
        const popupCheck = setInterval(() => { if (popup?.closed) cleanup(); }, 500);
        window.addEventListener('message', handleMsg);
    };

    // Fetch available projects for scope selector
    const { data: projectsData } = useFetch('projects/user-projects/');

    // Fetch Google Calendar events when toggle is on
    const { data: googleEventsData } = useFetch(showMyCalendar ? 'gmail/calendar/events/' : null);

    // Fetch Phases and Delivery Dates — studio-wide or project-scoped
    const { data: phasesData, isLoading: phasesLoading } = useFetch(
        selectedProjectId ? `projects/project-phases/?project_id=${selectedProjectId}` : 'projects/studio-phases/'
    );
    const { data: deliveryDatesData, isLoading: deliveryLoading } = useFetch(
        selectedProjectId ? `projects/project-delivery-dates/?project_id=${selectedProjectId}` : 'projects/studio-delivery-dates/'
    );

// Parse Google Calendar events
    const googleEvents = useMemo(() => {
        const eventsArray = (googleEventsData as any)?.events;
        if (!showMyCalendar || !Array.isArray(eventsArray)) return [];
        return eventsArray.map((e: any) => {
            // Handle both formats: direct string (e.start) or nested object (e.start.date / e.start.dateTime)
            let eventDate = null;
            if (typeof e.start === 'string') {
                eventDate = parseISO(e.start.substring(0, 10));
            } else if (e.start?.date) {
                eventDate = parseISO(e.start.date.substring(0, 10));
            } else if (e.start?.dateTime) {
                eventDate = parseISO(e.start.dateTime.substring(0, 10));
            }
            return { ...e, eventDate };
        }).filter((e: any) => e.eventDate);
    }, [googleEventsData, showMyCalendar]);


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
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        if (view === 'day') setCurrentDate(addDays(currentDate, -1));
    };

    const handleNext = () => {
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
            // Light green card
            'bg-[#e8f0e8] text-[#4a5f4a] border-[#c5d9c5]',
            // Light beige card
            'bg-[#f5f3ef] text-[#6b6560] border-[#e5e0d8]',
            // Light orange card
            'bg-[#fceee8] text-[#8b5a42] border-[#f5d4c4]',
        ];
        return colors[id % colors.length];
    };



    const getPhaseColor = (id: number, rowIdx: number) => {
        const colors = [
            // Lighter muted green
            'bg-[#93A490] text-white border-[#c5d9c5]',
            // Lighter beige
            'bg-[#e8e4db] text-[#6b6560] border-[#e5e0d8]',
            // Lighter coral/orange
            'bg-[#e07a57] border-[#e07a57] text-white',
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
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
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
                        let visibleRows = allRows.slice(0, 3);

                        if (filterType === 'delivery') {
                            visibleRows = [];
                        }

                        const hiddenPhases = allRows.slice(3).flat();

                        return (
                            <div key={weekIdx} className={`border-b border-gray-100 relative group ${isMonthView ? 'h-[240px]' : 'h-[400px]'}`}>
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
                                                border-r relative border-gray-100 h-full p-2 transition-colors pointer-events-auto cursor-pointer overflow-hidden
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

                                                {/* Delivery Dates - Full width pills, positioned above the +N phases indicator */}
                                                {(filterType === 'all' || filterType === 'delivery') && (() => {
                                                    const dayDeliveries = deliveryDates.filter((del: any) => isSameDay(del.deliveryDate, d));
                                                    if (dayDeliveries.length === 0) return null;

                                                    const maxVisible = 2;
                                                    const visibleDeliveries = dayDeliveries.slice(0, maxVisible);
                                                    const hiddenCount = dayDeliveries.length - maxVisible;

                                                    // Check if there are hidden phases for this day
                                                    const hiddenPhasesCount = filterType !== 'delivery' ? hiddenPhases.filter((p: any) =>
                                                        (p.startDate <= endOfDay(d) && p.endDate >= startOfDay(d))
                                                    ).length : 0;

                                                    return (
                                                        <TooltipProvider>
                                                            <Tooltip delayDuration={100}>
                                                                <TooltipTrigger asChild>
                                                                    <div className={`absolute left-1 right-1 flex flex-col gap-0.5 pointer-events-auto cursor-pointer`} style={{ zIndex: 50, bottom: hiddenPhasesCount > 0 ? '36px' : '4px' }}>
                                                                        {visibleDeliveries.map((del: any, idx: number) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="bg-purple-100 text-purple-700 text-[9px] font-medium px-1.5 py-1 rounded-[8px] truncate w-full"
                                                                            >
                                                                                {del.product_name}
                                                                            </div>
                                                                        ))}
                                                                        {hiddenCount > 0 && (
                                                                            <span className="text-[9px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded w-fit">
                                                                                +{hiddenCount} more
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent
                                                                    side="right"
                                                                    className="p-0 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden w-[380px]"
                                                                    sideOffset={12}
                                                                >
                                                                    <div className="px-4 py-3 border-b border-gray-100">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Deliveries</span>
                                                                            <span className="text-[11px] font-medium text-gray-900 bg-stone-100 px-2 py-0.5 rounded-full">{dayDeliveries.length}</span>
                                                                        </div>
                                                                        <p className="text-sm font-semibold text-gray-900 mt-1">{format(d, 'EEEE, MMMM d')}</p>
                                                                    </div>
                                                                    <div className="p-2 space-y-1 max-h-[240px] overflow-y-auto">
                                                                        {dayDeliveries.map((del: any) => (
                                                                            <div key={del.id} className="px-3 py-2.5 rounded-lg hover:bg-stone-50 transition-colors group">
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="font-medium text-[13px] text-gray-900 truncate">{del.product_name}</p>
                                                                                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{del.project_name}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    );
                                                })()}
                                                {/* Google Calendar Events */}
                                                {showMyCalendar && googleEvents.filter((e: any) => isSameDay(e.eventDate, d)).map((e: any) => (
                                                    <TooltipProvider key={e.id}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="mt-1 bg-sky-100 border border-sky-200 text-sky-700 text-[11px] px-1 py-0.5 rounded-[8px] truncate capitalize text-center">
                                                                    {e.summary || 'Event'}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <div className="space-y-1.5">
                                                                    <p className="capitalize font-semibold">{e.summary || 'Event'}</p>
                                                                    {e.description && <p className="text-xs text-gray-600">{e.description}</p>}
                                                                    {e.location && (
                                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <span className="font-semibold">Location:</span> {e.location}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs text-gray-500">
                                                                        <span className="font-semibold">Time:</span> {format(parseISO(e.start), 'MMM d, yyyy h:mm a')} - {format(parseISO(e.end), 'MMM d, yyyy h:mm a')}
                                                                    </p>
                                                                    {e.attendees && e.attendees.length > 0 && (
                                                                        <div className="text-xs text-gray-500">
                                                                            <span className="font-semibold">Attendees:</span>
                                                                            <div className="mt-0.5 flex flex-wrap gap-1">
                                                                                {e.attendees.map((attendee: string, idx: number) => (
                                                                                    <span key={idx} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">{attendee}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {e.status && (
                                                                        <p className="text-xs">
                                                                            <span className="font-semibold">Status:</span>{' '}
                                                                            <span className={e.status === 'Confirmed' ? 'text-green-700 capitalize' : 'text-gray-600 capitalize'}>{e.status}</span>
                                                                        </p>
                                                                    )}
                                                                    {e.link && (
                                                                        <Link href={e.link} target="_blank" rel="noopener noreferrer" className="text-xs  hover:underline block mt-1">
                                                                            Open in Google Calendar
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ))}

                                                {(() => {
                                                    // Hide the +{n} indicator when only deliveries are selected
                                                    if (filterType === 'delivery') return null;

                                                    const hiddenCount = hiddenPhases.filter((p: any) =>
                                                        (p.startDate <= endOfDay(d) && p.endDate >= startOfDay(d))
                                                    ).length;

                                                    if (hiddenCount > 0) {
                                                        return (
                                                            <div className="absolute bottom-1 left-1 bg-stone-100 text-gray-500 text-[10px] font-semibold px-2 py-1 rounded-[8px]">
                                                                +{hiddenCount} phases
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
                                                                    absolute h-6 rounded-sm px-2 flex items-center truncate text-white pointer-events-auto cursor-pointer transition-all hover:opacity-90
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
                                                                <div className="text-xs mt-1">Progress: {phase.progress}%</div>
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
        const activePhases = (filterType === 'all' || filterType === 'phases') ? phases.filter((p: any) =>
            isWithinInterval(currentDate, { start: startOfDay(p.startDate), end: endOfDay(p.endDate) })
        ) : [];

        const dayDeliveries = (filterType === 'all' || filterType === 'delivery') ? deliveryDates.filter((del: any) =>
            isSameDay(del.deliveryDate, currentDate)
        ) : [];

        const hasContent = activePhases.length > 0 || dayDeliveries.length > 0;

        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{format(currentDate, 'EEEE')}</h2>
                        <p className="text-gray-500">{format(currentDate, 'MMMM do, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(filterType === 'all' || filterType === 'phases') && (
                            <Badge variant="outline" className="px-3 py-1 text-sm">
                                {activePhases.length} Phase{activePhases.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {(filterType === 'all' || filterType === 'delivery') && (
                            <Badge variant="outline" className="px-3 py-1 text-sm bg-purple-50 text-purple-700 border-purple-200">
                                {dayDeliveries.length} Deliver{dayDeliveries.length !== 1 ? 'ies' : 'y'}
                            </Badge>
                        )}
                    </div>
                </div>

                {!hasContent ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p>No events scheduled for this day.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Phases Section */}
                        {activePhases.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Phases</h3>
                                {activePhases.map((phase: any, index: number) => (
                                    <div key={phase.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:bg-white hover:shadow-sm transition-all">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{phase.project_name} - {phase.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-2xl">{phase.description}</p>
                                            </div>
                                            <div className="px-2 py-1 rounded text-xs font-medium text-gray-500">
                                                {format(phase.startDate, 'MMM d')} - {format(phase.endDate, 'MMM d')}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Progress</span>
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

                        {/* Deliveries Section */}
                        {dayDeliveries.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Deliveries</h3>
                                {dayDeliveries.map((del: any) => (
                                    <div key={del.id} className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-white hover:shadow-sm transition-all">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{del.product_name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{del.project_name}</p>
                                                <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>ETA: {format(del.deliveryDate, 'MMMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };




    const renderMyCalendarView = () => {
        const gmailConnected = Array.isArray((googleEventsData as any)?.events);
        const hasEvents = googleEvents.length > 0;

        const emptyCard = (title: string, body: string, action?: React.ReactNode) => (
            <div className="w-full h-full min-h-[400px] bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center max-w-sm px-8">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-5">
                        <CalendarIcon className="w-7 h-7 text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{body}</p>
                    {action}
                </div>
            </div>
        );

        if (!gmailConnected) {
            return emptyCard(
                'Connect Google Calendar',
                'Link your Gmail account to see your personal events, meetings and appointments here alongside your studio schedule.',
                <button
                    onClick={handleGoogleCalendarConnect}
                    disabled={isConnecting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors disabled:opacity-60"
                >
                    {isConnecting ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting...</> : 'Connect Gmail'}
                </button>
            );
        }

        if (!hasEvents) {
            return emptyCard(
                'No upcoming events',
                'Your Google Calendar is connected but has no events to show in this period.'
            );
        }

        // Has events — render month view (Google events already overlay on the grid)
        return renderMonthView();
    };

    const renderCurrentView = () => {
        if (showMyCalendar) return renderMyCalendarView();
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
                        {/* View dropdown */}
                        {(
                            <Select value={view} onValueChange={(val: any) => setView(val)}>
                                <SelectTrigger className="w-[110px] h-9 bg-white border-gray-200 text-sm font-medium">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">Month</SelectItem>
                                    <SelectItem value="week">Week</SelectItem>
                                    <SelectItem value="day">Day</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold w-32 text-center select-none">
                                {format(currentDate, 'MMMM yyyy')}
                            </span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* <Button variant="outline" size="sm" onClick={handleToday}>
                            Today
                        </Button> */}

                        <AddEventDialog
                            mode={showMyCalendar ? 'my-calendar' : selectedProjectId ? 'single-project' : 'all-projects'}
                            projectId={selectedProjectId}
                            projectName={selectedProjectId && Array.isArray(projectsData)
                                ? (projectsData as any[]).find((p: any) => String(p.id) === selectedProjectId)?.project_name || null
                                : null}
                            projects={Array.isArray(projectsData)
                                ? (projectsData as any[]).map((p: any) => ({ id: p.id, project_name: p.project_name || `Project ${p.id}` }))
                                : []}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Project scope — hidden in My Calendar mode */}
                        {!showMyCalendar && <Select value={selectedProjectId ?? 'all'} onValueChange={(val) => setSelectedProjectId(val === 'all' ? null : val)}>
                            <SelectTrigger className="w-[160px] h-9 bg-white border-gray-200">
                                <SelectValue>{selectedProjectId
                                    ? (Array.isArray(projectsData) ? (projectsData as any[]).find((p: any) => String(p.id) === selectedProjectId)?.project_name || 'Project' : 'Project')
                                    : 'All Projects'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {Array.isArray(projectsData) && (projectsData as any[]).map((p: any) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.project_name || p.name || p.title || `Project ${p.id}`}</SelectItem>
                                ))}
                                {(!Array.isArray(projectsData) || (projectsData as any[]).length === 0) && (
                                    <div className="px-3 py-2 text-xs text-gray-400">No projects found</div>
                                )}
                            </SelectContent>
                        </Select>}

                        {/* Filter — hidden in My Calendar mode */}
                        {!showMyCalendar && <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                            <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="phases">Phases</SelectItem>
                                <SelectItem value="delivery">Deliveries</SelectItem>
                            </SelectContent>
                        </Select>}

                        {/* Search — hidden in My Calendar mode */}
                        {!showMyCalendar && <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="h-9 w-48 pl-9 bg-white border-gray-200"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>}

                        {/* My Calendar toggle */}
                        <Button
                            variant={showMyCalendar ? 'default' : 'outline'}
                            size="sm"
                            className={`h-9 px-3 text-xs font-medium ${showMyCalendar ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                            onClick={() => setShowMyCalendar(!showMyCalendar)}
                        >
                            My Calendar
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                    {/* Main Calendar Grid */}
                    <div className="flex-1 relative min-w-0">
                        {renderCurrentView()}
                    </div>

                    {/* Sidebar (Day Details) - Only show in Month/Week view for context */}
                    {/* Sidebar (Day Details) - Only show in Month/Week view for context */}
                    {!showMyCalendar && view !== 'day' && (
                        <div className="w-80 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col shrink-0 h-screen overflow-scroll">
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
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Phases</h3>
                                        {phasesForSelectedDate.map((phase: any) => (
                                            <div key={phase.id} className={`p-3 rounded-lg border ${getPhaseLightColor(phase.colorIndex)}`}>
                                                <h3 className="font-medium text-sm">{phase.project_name}</h3>
                                                <p className="text-xs mt-1 opacity-80 line-clamp-2">{phase.name}</p>
                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <span className="font-medium">{phase.progress}% Done</span>
                                                    <span className="opacity-70">{format(phase.endDate, 'MMM d')}</span>
                                                </div>
                                                <div className="w-full bg-white/60 h-1.5 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-current opacity-40 rounded-full" style={{ width: `${phase.progress}%` }} />
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

                                {/* My Calendar (Google) Events */}
                                {showMyCalendar && googleEvents.filter((e: any) => isSameDay(e.eventDate, selectedDate)).length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Calendar</h3>
                                        {googleEvents
                                            .filter((e: any) => isSameDay(e.eventDate, selectedDate))
                                            .map((e: any) => (
                                                <div key={e.id} className="p-3 rounded-lg border border-sky-100 bg-sky-50">
                                                    <h3 className="font-medium text-sm text-sky-900">{e.summary || 'Event'}</h3>
                                                    {e.description && <p className="text-xs text-sky-700 mt-1">{e.description}</p>}
                                                    {e.location && (
                                                        <p className="text-xs text-sky-600 mt-1 flex items-center gap-1">
                                                            <span className="font-medium">Location:</span> {e.location}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-sky-600">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{format(parseISO(e.start), 'MMM d, yyyy h:mm a')} - {format(parseISO(e.end), 'MMM d, yyyy h:mm a')}</span>
                                                    </div>
                                                    {e.attendees && e.attendees.length > 0 && (
                                                        <div className="mt-2 text-xs text-sky-700">
                                                            <span className="font-medium">Attendees:</span>
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {e.attendees.map((attendee: string, idx: number) => (
                                                                    <span key={idx} className="bg-sky-100 px-1.5 py-0.5 rounded text-[10px]">{attendee}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {e.status && (
                                                        <p className="text-xs mt-1">
                                                            <span className="font-medium text-sky-700">Status:</span>{' '}
                                                            <span className={e.status === 'confirmed' ? 'text-green-600' : 'text-sky-600'}>{e.status}</span>
                                                        </p>
                                                    )}
                                                    {e.link && (
                                                        <a href={e.link} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline block mt-2">
                                                            Open in Google Calendar
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {((filterType === 'phases' && phasesForSelectedDate.length === 0) ||
                                    (filterType === 'delivery' && deliveryDates.filter((d: any) => isSameDay(d.deliveryDate, selectedDate)).length === 0) ||
                                    (filterType === 'all' && phasesForSelectedDate.length === 0 && deliveryDates.filter((d: any) => isSameDay(d.deliveryDate, selectedDate)).length === 0 && (!showMyCalendar || googleEvents.filter((e: any) => isSameDay(e.eventDate, selectedDate)).length === 0))) && (
                                        <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-200">
                                            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No events for this date.</p>
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
