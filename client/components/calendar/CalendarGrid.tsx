import React from 'react';
import { format, isSameDay, isSameMonth, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LayoutItem } from '@/hooks/calendar/useCalendarLayout';

interface CalendarGridProps {
  days: Date[];
  weeks: Date[][];
  isMonthView: boolean;
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  phases: any[];
  deliveries: any[];
  tasks: any[];
  getLayoutRows: (items: LayoutItem[], rangeStart: Date, rangeEnd: Date) => LayoutItem[][];
  getPhaseColor: (id: number, rowIdx: number) => string;
  getTaskStatusConfig: (status: string) => any;
}

export function CalendarGrid({
  days,
  weeks,
  isMonthView,
  currentDate,
  selectedDate,
  onDateSelect,
  phases,
  deliveries,
  tasks,
  getLayoutRows,
  getPhaseColor,
  getTaskStatusConfig,
}: CalendarGridProps) {
  const start = days[0];
  const end = days[days.length - 1];

  // Filter items in range
  const phasesInRange = phases.filter((p: any) => p.startDate <= endOfDay(end) && p.endDate >= startOfDay(start));
  const tasksInRange = tasks.filter((t: any) => t.startDate <= endOfDay(end) && t.endDate >= startOfDay(start));

  return (
    <div className="flex animate-in fade-in slide-in-from-bottom-2 duration-200 flex-col h-full border border-gray-200 rounded-lg overflow-y-scroll bg-white shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-stone-50">
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

          // Get rows for phases
          const phaseRows = getLayoutRows(phasesInRange, weekStart, weekEnd);
          const visiblePhaseRows = phaseRows.slice(0, 3);
          const hiddenPhases = phaseRows.slice(3).flat();

          // Get rows for tasks
          const taskRows = getLayoutRows(tasksInRange, weekStart, weekEnd);
          const visibleTaskRows = taskRows.slice(0, 2);
          const hiddenTasks = taskRows.slice(2).flat();

          return (
            <div
              key={weekIdx}
              className={`flex-1 border-b border-gray-100 relative group ${isMonthView ? 'min-h-[140px]' : 'min-h-[400px]'}`}
            >
              {/* Background Grid */}
              <div className="absolute inset-0 grid grid-cols-7 z-0 pointer-events-none overflow-hidden">
                {weekDays.map((d) => {
                  const isToday = isSameDay(d, new Date());
                  const isCurrentMonth = isSameMonth(d, currentDate);
                  const isSelected = isSameDay(d, selectedDate);

                  return (
                    <div
                      key={d.toISOString()}
                      className={`
                        border-r relative border-gray-100 h-full p-2 transition-colors pointer-events-auto cursor-pointer
                        ${!isCurrentMonth && isMonthView ? 'bg-stone-50/30' : 'bg-white'}
                        ${isSelected ? '!bg-[#fffaf3]' : 'hover:bg-stone-50'}
                      `}
                      onClick={() => onDateSelect(d)}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`
                            text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full
                            ${isToday ? 'bg-gray-900 text-white' : isCurrentMonth || !isMonthView ? 'text-gray-700' : 'text-gray-400'}
                          `}
                        >
                          {format(d, 'd')}
                        </span>

                        {/* Delivery Dots - bottom-right of day number */}
                        <div className="flex flex-row gap-0.5">
                          {deliveries
                            .filter((del: any) => isSameDay(del.deliveryDate, d))
                            .map((del: any) => (
                              <TooltipProvider key={del.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-[6px] h-[6px] rounded-full bg-purple-500 pointer-events-auto cursor-pointer"></div>
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event Bars Container - fixed height with overflow hidden */}
              <div className="relative z-10 w-[98%] mx-auto mt-10 pointer-events-none overflow-hidden" style={{ maxHeight: '118px' }}>
                {/* Phase Bars - 3 rows max, h-5 each */}
                {visiblePhaseRows.map((rowItems, rowIdx) => (
                  <div key={`phase-${rowIdx}`} className="relative h-5 mb-0.5 w-full text-xs">
                    {rowItems.map((phase: any) => {
                      const phaseStartDay = phase.startDate < weekStart ? weekStart : phase.startDate;
                      const phaseEndDay = phase.endDate > weekEnd ? weekEnd : phase.endDate;

                      const startOffset = differenceInDays(phaseStartDay, weekStart);
                      const duration = differenceInDays(phaseEndDay, phaseStartDay) + 1;

                      if (startOffset < 0 && startOffset + duration <= 0) return null;

                      // Only show label if duration >= 3 days AND phase starts this week
                      const showLabel = duration >= 3 && phase.startDate >= weekStart;

                      return (
                        <TooltipProvider key={phase.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`
                                  absolute h-5 rounded-[12px] px-2 flex items-center truncate text-white text-[10px] pointer-events-auto cursor-pointer transition-all hover:opacity-90 hover:scale-[1.01]
                                  ${getPhaseColor(phase.colorIndex, rowIdx)}
                                `}
                                style={{
                                  left: `${(startOffset / 7) * 100}%`,
                                  width: `calc(${(duration / 7) * 100}% - 0px)`,
                                  marginLeft: '0px',
                                  marginRight: '0px',
                                }}
                              >
                                {showLabel && `${phase.project_name} - ${phase.name}`}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="font-semibold">{phase.project_name}</div>
                              <div className="text-sm">{phase.name}</div>
                              <div className="text-xs text-gray-500">
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

                {/* Task Bars - 2 rows max, h-5 each */}
                {visibleTaskRows.map((rowItems, rowIdx) => (
                  <div key={`task-${rowIdx}`} className="relative h-5 mb-0.5 w-full text-xs">
                    {rowItems.map((task: any) => {
                      const taskStartDay = task.startDate < weekStart ? weekStart : task.startDate;
                      const taskEndDay = task.endDate > weekEnd ? weekEnd : task.endDate;

                      const startOffset = differenceInDays(taskStartDay, weekStart);
                      const duration = differenceInDays(taskEndDay, taskStartDay) + 1;

                      if (startOffset < 0 && startOffset + duration <= 0) return null;

                      const statusConfig = getTaskStatusConfig(task.status);

                      // Only show label if duration >= 3 days AND task starts this week
                      const showLabel = duration >= 3 && task.startDate >= weekStart;

                      return (
                        <TooltipProvider key={task.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`
                                  absolute h-5 rounded-[12px] px-2 flex items-center truncate text-white text-[10px] pointer-events-auto cursor-pointer transition-all hover:opacity-90 hover:scale-[1.01]
                                  ${statusConfig.barClassName}
                                `}
                                style={{
                                  left: `${(startOffset / 7) * 100}%`,
                                  width: `calc(${(duration / 7) * 100}% - 0px)`,
                                  marginLeft: '0px',
                                  marginRight: '0px',
                                }}
                              >
                                {showLabel && `${task.project_name} - ${task.title}`}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="font-semibold">{task.project_name}</div>
                              <div className="text-sm">{task.title}</div>
                              <div className="text-xs text-gray-500">
                                {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                              </div>
                              <div className="text-xs mt-1">Status: {statusConfig.label}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* +N more chip - below event bars */}
              {(hiddenPhases.length > 0 || hiddenTasks.length > 0) && (
                <div className="relative z-10 w-[98%] mx-auto mt-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-[10px] text-gray-500 font-medium px-1 cursor-pointer hover:text-gray-800">
                          +{hiddenPhases.length + hiddenTasks.length} more
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          {hiddenPhases.length > 0 && (
                            <div className="font-semibold text-xs">Hidden Phases: {hiddenPhases.length}</div>
                          )}
                          {hiddenTasks.length > 0 && (
                            <div className="font-semibold text-xs">Hidden Tasks: {hiddenTasks.length}</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
