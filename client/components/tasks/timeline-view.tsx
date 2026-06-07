'use client';

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isWeekend,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear
} from "date-fns";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import useFetch from "@/hooks/useFetch";

/* =================== Date utils (Helpers) =================== */
// Helper to format date for display if needed
function formatShort(d: Date | string) {
  if (!d) return "";
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, "MMM d");
}

/* =================== Component =================== */
export default function TimelineView({
  tasks: _tasks,
  setTasks: _setTasks,
  phases: _phases,
  lists: _lists,
  team: _team,
  onEditTask: _onEditTask,
  onCreateTask: _onCreateTask,
  project: _project,
}: {
  tasks?: any[];
  setTasks?: any;
  phases?: any[];
  lists?: any[];
  team?: any[];
  onEditTask?: any;
  onCreateTask?: any;
  project?: any;
}) {
  const params = useParams();
  const projectId = (params?.id as string) || "p-demo";

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month' | 'quarter'>('month');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

  // 1. Fetch Data
  const { data: tasksData, isLoading } = useFetch(`projects/project-phases-tasks/?project_id=${projectId}`, {
    enabled: !!projectId
  });

  // 2. Parse Data
  const phases = useMemo(() => {
    if (!Array.isArray(tasksData)) return [];

    return tasksData.map((p: any, index: number) => ({
      ...p,
      startDate: p.start_date ? parseISO(p.start_date) : null,
      endDate: p.end_date ? parseISO(p.end_date) : null,
      colorIndex: index,
      tasks: (p.tasks || []).map((t: any) => ({
        ...t,
        startDate: t.start_date ? parseISO(t.start_date) : null,
        endDate: t.end_date ? parseISO(t.end_date) : null,
      }))
    })).filter(p => p.startDate && p.endDate);
  }, [tasksData]);

  // Toggle Phase Expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  // --- TIMELINE HELPERS ---

  const getPhaseColor = (index: number) => {
    const colors = [
      'bg-[#101828] border-[#101828] text-white', // Navy
      'bg-[#C7654F] border-[#C7654F] text-white', // Terracotta
      'bg-[#8B5CF6] border-[#8B5CF6] text-white', // Purple
      'bg-[#10B981] border-[#10B981] text-white', // Emerald
      'bg-[#F59E0B] border-[#F59E0B] text-white', // Amber
      'bg-[#64748B] border-[#64748B] text-white', // Slate
    ];
    return colors[index % colors.length];
  };

  const renderTimeline = () => {

    // 1. Determine Range & Columns
    const now = new Date();
    let rangeStart: Date, rangeEnd: Date, columns: { label: React.ReactNode, subLabel?: React.ReactNode, date: Date, width: number, isWeekend?: boolean }[] = [];

    if (view === 'week') {
      rangeStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
      rangeEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });

      // Generate columns per Week
      let iter = rangeStart;
      let weekIdx = 1;
      while (iter <= rangeEnd) {
        columns.push({
          label: `Week ${weekIdx}`,
          subLabel: format(iter, 'MMM d'),
          date: iter,
          width: 200, // Wide column for Week
          isWeekend: false // Not relevant for week col
        });
        iter = addWeeks(iter, 1);
        weekIdx++;
      }
    } else if (view === 'month') {
      // Month View: Show Days of Current Month
      rangeStart = startOfMonth(currentDate);
      rangeEnd = endOfMonth(currentDate);

      const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
      columns = days.map(d => ({
        label: format(d, 'd'), // 1, 2, 3
        subLabel: format(d, 'EEE'), // Mon, Tue
        date: d,
        width: 50, // More compact for days
        isWeekend: isWeekend(d)
      }));
    } else {
      // Quarter View
      rangeStart = startOfMonth(startOfYear(currentDate));
      rangeEnd = endOfMonth(endOfYear(currentDate));

      const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });
      columns = months.map(d => ({
        label: format(d, 'MMM'),
        date: d,
        width: 80
      }));
    }

    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const SIDEBAR_WIDTH = 280;

    return (
      <div className="flex-1 bg-stone">
        <div className=" space-y-6">
          {/* Timeline Controls */}
          <div className="p-4 border rounded-[12px] border-gray-200 flex items-center justify-between bg-white">
            <div className="flex bg-stone-100 rounded-lg p-1">
              {(['week', 'month', 'quarter'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center  gap-2 ">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <div className="flex items-center gap-1 bg-stone-50 rounded-md border border-gray-200 p-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                  if (view === 'week') setCurrentDate(d => addWeeks(d, -4));
                  else if (view === 'month') setCurrentDate(d => addMonths(d, -1));
                  else setCurrentDate(d => addYears(d, -1));
                }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2 min-w-[100px] text-center">
                  {view === 'week'
                    ? format(currentDate, 'MMMM yyyy')
                    : view === 'month'
                      ? format(currentDate, 'MMMM yyyy')
                      : format(currentDate, 'yyyy')}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                  if (view === 'week') setCurrentDate(d => addWeeks(d, 4));
                  else if (view === 'month') setCurrentDate(d => addMonths(d, 1));
                  else setCurrentDate(d => addYears(d, 1));
                }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Container */}
          <div className="flex-1 border rounded-[12px] bg-white overflow-auto relative min-h-[480px]">
            <div style={{ minWidth: `${totalWidth + SIDEBAR_WIDTH}px` }}>

              {/* Sticky Header */}
              <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex h-16 shadow-sm">
                {/* Sidebar Header */}
                <div className="sticky left-0 z-50 bg-white border-r border-gray-200 flex items-center justify-between px-4"
                  style={{ width: `${SIDEBAR_WIDTH}px`, minWidth: `${SIDEBAR_WIDTH}px` }}>
                  <span className="font-semibold text-gray-700">Phases & Work Packages</span>
                  {/* <Button size="sm" variant="ghost"><Plus className="h-4 w-4"/></Button> */}
                </div>

                {/* Timeline Header Columns */}
                <div className="flex">
                  {view === 'week' ? (
                    // Week View: Simple Weekly Columns
                    columns.map((col, i) => {
                      const isCurrent = isSameWeek(col.date, now, { weekStartsOn: 0 });
                      return (
                        <div key={i} className={`flex flex-col border-r border-gray-200 ${isCurrent ? 'bg-[#fffaf3]' : ''}`} style={{ width: col.width }}>
                          <div className="h-4 flex items-center justify-center text-xs font-semibold text-gray-600 mt-2">
                            {col.label}
                          </div>
                          <div className="h-4 flex items-center justify-center text-[10px] text-gray-400 mb-2">
                            {col.subLabel}
                          </div>
                        </div>
                      );
                    })
                  ) : view === 'quarter' ? (
                    // Quarter View: Group by Quarter
                    (() => {
                      const quarters: any[] = [];
                      let currentQuarter: any[] = [];
                      columns.forEach((col, i) => {
                        currentQuarter.push(col);
                        // End of quarter is Mar(2), Jun(5), Sep(8), Dec(11)
                        const m = col.date.getMonth();
                        if ([2, 5, 8, 11].includes(m) || i === columns.length - 1) {
                          quarters.push(currentQuarter);
                          currentQuarter = [];
                        }
                      });

                      return quarters.map((qCols, qIdx) => {
                        const qNum = Math.floor(qCols[0].date.getMonth() / 3) + 1;
                        // const width = qCols.reduce((s:number, c:any) => s + c.width, 0);
                        return (
                          <div key={qIdx} className="flex flex-col border-r border-gray-200">
                            <div className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 bg-stone-50 border-b border-gray-100">
                              Q{qNum}
                            </div>
                            <div className="flex h-8">
                              {qCols.map((col: any) => {
                                const isCurrent = isSameMonth(col.date, now);
                                return (
                                  <div key={col.date.toISOString()}
                                    className={`flex items-center justify-center text-xs font-medium text-gray-600 border-r border-gray-100 last:border-0 ${isCurrent ? 'bg-[#fffaf3]' : ''}`}
                                    style={{ width: col.width }}>
                                    {col.label}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      })
                    })()
                  ) : view === 'month' ? (
                    // Month View: Daily Columns
                    columns.map((col, i) => {
                      const isCurrent = isSameDay(col.date, now);
                      return (
                        <div key={i} className={`flex flex-col border-r border-gray-200 ${col.isWeekend ? 'bg-stone-50' : ''} ${isCurrent ? 'bg-[#fffaf3]' : ''}`} style={{ width: col.width }}>
                          <div className="h-4 flex items-center justify-center text-[10px] font-medium text-gray-400 mt-2">
                            {col.subLabel}
                          </div>
                          <div className="h-4 flex items-center justify-center text-sm font-semibold text-gray-700 mb-2">
                            {col.label}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Standard Month cols (used for Quarter view or fallback)
                    columns.map((col, i) => {
                      const isCurrent = isSameMonth(col.date, now);
                      return (
                        <div key={i} className={`flex flex-col border-r border-gray-200 ${isCurrent ? 'bg-[#fffaf3]' : ''}`} style={{ width: col.width }}>
                          <div className={`h-full flex items-center justify-center font-semibold text-sm text-gray-600 ${isCurrent ? 'bg-[#fffaf3]' : 'bg-stone-50'}`}>
                            {col.label}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="relative">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex pointer-events-none pl-[280px]">
                  {columns.map((col, i) => {
                    let isCurrent = false;
                    if (view === 'week') {
                      isCurrent = isSameWeek(col.date, now, { weekStartsOn: 0 });
                    } else if (view === 'month') {
                      isCurrent = isSameDay(col.date, now);
                    } else { // Quarter
                      isCurrent = isSameMonth(col.date, now);
                    }

                    return (
                      <div key={i} className={`border-r border-gray-100 h-full ${col.isWeekend && view === 'week' ? 'bg-stone-50/30' : ''} ${isCurrent ? 'bg-[#fffaf3]' : ''}`} style={{ width: col.width }} />
                    );
                  })}
                </div>

                {/* Rows */}
                {phases.map((phase, pIndex) => {
                  // Phase Positioning
                  let pLeft = 0;
                  let pWidth = 0;

                  // Check overlap with view range
                  if (phase.startDate && phase.endDate && phase.endDate >= rangeStart && phase.startDate <= rangeEnd) {
                    // "Snap to Grid" / "Bucket" Logic requested by user.
                    // If a task falls within a column (e.g. Nov), it should fill that column.

                    let startFound = false;
                    let currentX = 0;

                    // Reset for calculation
                    pLeft = 0;
                    pWidth = 0;

                    for (const col of columns) {
                      // Determine col range
                      let colStart = col.date;
                      let colEnd: Date;
                      if (view === 'week') {
                        colEnd = endOfWeek(colStart, { weekStartsOn: 0 });
                      } else if (view === 'month') {
                        colEnd = endOfDay(colStart);
                      } else {
                        colEnd = endOfMonth(colStart);
                      }

                      // Check Overlap
                      // Overlap if: (TopicStart <= ColEnd) and (TopicEnd >= ColStart)
                      const overlap = (phase.startDate <= colEnd && phase.endDate >= colStart);

                      if (overlap) {
                        if (!startFound) {
                          pLeft = currentX;
                          startFound = true;
                        }
                        // Extend width by this column
                        pWidth += col.width;
                      }

                      currentX += col.width;
                    }
                  }

                  const isExpanded = expandedPhases[phase.id];

                  return (
                    <div key={phase.id} className="group">
                      {/* Phase Row */}
                      <div className="flex border-b border-gray-100 hover:bg-stone-50 transition-colors h-12">
                        {/* Sidebar Cell */}
                        <div className="sticky left-0 z-30 bg-white border-r border-gray-200 px-4 flex items-center gap-2 group-hover:bg-stone-50"
                          style={{ width: `${SIDEBAR_WIDTH}px`, minWidth: `${SIDEBAR_WIDTH}px` }}>

                          <button onClick={() => togglePhase(phase.id)} className="p-1 border  rounded-[10px] text-gray-500">
                            <ChevronRight className={`h-4 duration-200 ease-in-out w-4 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>

                          <div className={`w-1 h-6 rounded-full ${getPhaseColor(pIndex).split(' ')[0]}`} />

                          <div className="min-w-0 flex gap-2 justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate">{phase.name}</div>
                              <div className="text-xs text-gray-500">
                                {phase.startDate ? format(phase.startDate, 'MMM d') : 'No date'} - {phase.endDate ? format(phase.endDate, 'MMM d') : 'No date'}
                              </div>
                            </div>
                            <div>
                              <span className="inline-flex  items-center px-2 h-6 rounded-full text-xs bg-stone-100 border border-gray-200 text-gray-700">
                                {Math.round(phase?.progress)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Bar Area */}
                        <div className="relative flex-1 h-full">
                          {pWidth > 0 && (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div
                                  className={`absolute top-2.5 h-7 rounded-[12px] border shadow-sm flex items-center px-3 text-xs font-medium truncate custom-phase-bar ${getPhaseColor(pIndex)} opacity-90 hover:opacity-100 cursor-pointer z-10`}
                                  style={{ left: `${pLeft}px`, width: `${Math.max(pWidth, 24)}px` }}
                                >
                                  {phase.name}
                                  {phase.progress > 0 && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-white/30" style={{ width: `${phase.progress}%` }} />
                                  )}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="p-3">
                                <div className="space-y-2">
                                  <h4 className="font-bold">{phase.name}</h4>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <div className="">
                                      <span>{formatShort(phase.startDate)}</span> -
                                      <span>{formatShort(phase.endDate)}</span>
                                    </div>
                                    <div>Progress: {phase.progress ? Math.round(phase.progress) : 0}%</div>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                        </div>
                      </div>

                      {/* Task Rows (if expanded) */}
                      {isExpanded && phase.tasks && phase.tasks.map((task: any) => {
                        // Use Snap to Grid Logic
                        let tLeft = 0;
                        let tWidth = 0;
                        // Check overlap with view range
                        if (task.startDate && task.endDate && task.endDate >= rangeStart && task.startDate <= rangeEnd) {
                          // "Snap to Grid" / "Bucket" Logic
                          // If a task falls within a column (e.g. Nov), it should fill that column.

                          let startFound = false;
                          let currentX = 0;

                          // Reset for calculation
                          tLeft = 0;
                          tWidth = 0;

                          for (const col of columns) {
                            // Determine col range
                            let colStart = col.date;
                            let colEnd: Date;
                            if (view === 'week') {
                              colEnd = endOfWeek(colStart, { weekStartsOn: 0 });
                            } else if (view === 'month') {
                              colEnd = endOfDay(colStart);
                            } else {
                              colEnd = endOfMonth(colStart);
                            }

                            // Check Overlap
                            // Overlap if: (TopicStart <= ColEnd) and (TopicEnd >= ColStart)
                            const overlap = (task.startDate <= colEnd && task.endDate >= colStart);

                            if (overlap) {
                              if (!startFound) {
                                tLeft = currentX;
                                startFound = true;
                              }
                              // Extend width by this column
                              tWidth += col.width;
                            }
                            currentX += col.width;
                          }
                        }

                        return (
                          <div key={task.id} className="flex  border-b border-gray-50 hover:bg-stone-50/50 transition-colors h-10">
                            <div className="sticky left-0 z-20 bg-stone-50/30 border-r border-gray-200 px-4 pl-16 flex items-center"
                              style={{ width: `${SIDEBAR_WIDTH}px`, minWidth: `${SIDEBAR_WIDTH}px` }}>
                              <span className="text-xs text-gray-600 truncate">{task.title}</span>
                            </div>
                            <div className="relative flex-1 h-full">
                              {tWidth > 0 ? (
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div
                                      className="absolute top-2.5 h-6 rounded-[10px] bg-[#efeae2] border border-[#efeae2] flex items-center px-2 text-[10px] text-gray-700 truncate cursor-pointer hover:bg-stone-200/80 transition-colors"
                                      style={{ left: `${tLeft}px`, width: `${Math.max(tWidth, 10)}px` }}
                                    >
                                      {task.title}
                                    </div>
                                  </HoverCardTrigger>

                                  <HoverCardContent className="p-3">
                                    <div className="space-y-1">
                                      <h4 className="font-semibold">{task.title}</h4>
                                      <div className=" text-xs text-muted-foreground ">
                                        <span>{formatShort(task.startDate)}</span> -
                                        <span>{formatShort(task.endDate)}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Status: {task.status || 'Pending'}
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              ) : (null)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderTimeline();
}
