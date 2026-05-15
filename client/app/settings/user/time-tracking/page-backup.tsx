'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Square, ChevronDown, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Period = 'today' | 'week' | 'month';

// TODO: All data below is mock. Backend time-tracking endpoints do not yet exist.
// When ready, replace these constants with useFetch calls (same pattern as other pages).

// Mock data - Active timer
const activeTimer = {
  task: 'Design review - Living room layout',
  project: 'Hampstead Townhouse',
  elapsed: '01:23:45',
  isRunning: true,
};

// Mock data - Weekly heatmap (9am-5pm for Mon-Fri)
const weeklyHeatmap: Record<string, number[]> = {
  Mon: [4, 3, 2, 0, 2, 4, 3, 1, 0],
  Tue: [2, 4, 3, 1, 3, 4, 2, 3, 0],
  Wed: [3, 4, 4, 3, 0, 2, 4, 3, 1],
  Thu: [4, 3, 2, 0, 3, 4, 0, 0, 0],
  Fri: [0, 0, 0, 0, 0, 0, 0, 0, 0],
};

// Mock data - Time entries grouped by period
const timeEntriesByPeriod = {
  today: {
    label: 'Today',
    totalHours: '5.25h',
    billableHours: '4.75h',
    entries: [
      { id: 1, task: 'Client presentation prep', project: 'Hampstead Townhouse', time: '9:00 - 11:30', duration: '2.5h', billable: true },
      { id: 2, task: 'Team standup', project: 'Internal', time: '11:30 - 12:00', duration: '0.5h', billable: false },
      { id: 3, task: 'Supplier research', project: 'Chelsea Penthouse', time: '13:00 - 15:15', duration: '2.25h', billable: true },
    ],
  },
  week: {
    label: 'This Week',
    totalHours: '32.25h',
    billableHours: '28h',
    entries: [
      { id: 1, date: 'Thu 16', task: 'Client presentation prep', project: 'Hampstead Townhouse', duration: '2.5h', billable: true },
      { id: 2, date: 'Thu 16', task: 'Team standup', project: 'Internal', duration: '0.5h', billable: false },
      { id: 3, date: 'Thu 16', task: 'Supplier research', project: 'Chelsea Penthouse', duration: '2.25h', billable: true },
      { id: 4, date: 'Wed 15', task: 'Design review meeting', project: 'Hampstead Townhouse', duration: '1.5h', billable: true },
      { id: 5, date: 'Wed 15', task: 'Mood board creation', project: 'Chelsea Penthouse', duration: '3h', billable: true },
      { id: 6, date: 'Wed 15', task: 'Email correspondence', project: 'Internal', duration: '1h', billable: false },
      { id: 7, date: 'Tue 14', task: 'Site visit', project: 'Soho Members Club', duration: '4h', billable: true },
      { id: 8, date: 'Tue 14', task: 'Contractor coordination', project: 'Hampstead Townhouse', duration: '2h', billable: true },
      { id: 9, date: 'Mon 13', task: 'Weekly planning', project: 'Internal', duration: '1h', billable: false },
      { id: 10, date: 'Mon 13', task: 'Material sourcing', project: 'Chelsea Penthouse', duration: '3.5h', billable: true },
    ],
  },
  month: {
    label: 'This Month',
    totalHours: '110.75h',
    billableHours: '94h',
    entries: [
      { id: 1, date: 'Week 3', task: '13 - 17 Jan', project: '', duration: '32.25h', billable: true },
      { id: 2, date: 'Week 2', task: '6 - 12 Jan', project: '', duration: '38.5h', billable: true },
      { id: 3, date: 'Week 1', task: '1 - 5 Jan', project: '', duration: '24h', billable: true },
      { id: 4, date: 'Dec', task: '23 - 31 Dec', project: '', duration: '16h', billable: true },
    ],
  },
};

// Projects list for Log Time
const projects = ['Hampstead Townhouse', 'Chelsea Penthouse', 'Soho Members Club', 'Kensington Mews'];

function getHeatmapColor(intensity: number) {
  switch (intensity) {
    case 0: return 'bg-stone-100';
    case 1: return 'bg-sage-100';
    case 2: return 'bg-sage-200';
    case 3: return 'bg-sage-400';
    case 4: return 'bg-sage-600';
    default: return 'bg-stone-100';
  }
}

export default function TimeTrackingSettingsPage() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [quickLogDescription, setQuickLogDescription] = useState('');
  const [quickLogDuration, setQuickLogDuration] = useState('');
  const [period, setPeriod] = useState<Period>('today');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPeriodDropdownOpen(false);
      }
    }
    if (periodDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [periodDropdownOpen]);

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
  const currentData = timeEntriesByPeriod[period];

  return (
    <div className="space-y-6">
      {/* Page header — matches other settings pages */}
      <div>
        <h2 className="text-xl text-neutral-900 mb-1">Time Tracking</h2>
        <p className="text-sm text-neutral-500">Track time spent across your projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Weekly Activity Heatmap */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-neutral-500">This Week's Activity</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Less</span>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn('w-2.5 h-2.5 rounded-sm', getHeatmapColor(i))} />
                  ))}
                </div>
                <span className="text-xs text-neutral-400">More</span>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-1">
              <div className="h-5" />
              {hours.map((hour) => (
                <div key={hour} className="h-5 flex items-center justify-center text-xs text-neutral-400">
                  {hour}
                </div>
              ))}

              {days.map((day) => (
                <React.Fragment key={day}>
                  <div className={cn('h-6 flex items-center justify-end pr-2 text-xs', day === 'Thu' ? 'text-neutral-900 font-medium' : 'text-neutral-400')}>
                    {day}
                  </div>
                  {weeklyHeatmap[day].map((intensity, idx) => (
                    <div key={idx} className={cn('h-6 rounded-sm', getHeatmapColor(intensity))} />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Time Entries Table */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            {/* Table Header with Period Dropdown */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                >
                  <Calendar className="w-4 h-4" />
                  {currentData.label}
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </Button>

                {periodDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-1.5 z-50">
                    <div className="flex items-center gap-1">
                      {([
                        { key: 'today' as Period, Icon: CalendarDays, label: 'Today' },
                        { key: 'week' as Period, Icon: CalendarRange, label: 'Week' },
                        { key: 'month' as Period, Icon: Calendar, label: 'Month' },
                      ]).map(({ key, Icon, label }) => (
                        <button
                          key={key}
                          onClick={() => { setPeriod(key); setPeriodDropdownOpen(false); }}
                          className={cn(
                            'flex flex-col items-center justify-center gap-1.5 w-16 h-14 rounded text-xs transition-colors',
                            period === key ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-stone-50'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-neutral-500">
                  Billable: <span className="text-emerald-600 font-medium">{currentData.billableHours}</span>
                </span>
                <span className="text-neutral-900 font-medium">{currentData.totalHours} total</span>
              </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-stone-50 text-xs text-neutral-500 border-b border-neutral-200">
              {period !== 'today' && <div className="col-span-1">Date</div>}
              <div className={period === 'today' ? 'col-span-5' : 'col-span-4'}>Task</div>
              <div className="col-span-3">Project</div>
              {period === 'today' && <div className="col-span-2">Time</div>}
              <div className="col-span-1 text-right">Duration</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Entries */}
            {currentData.entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  'grid grid-cols-12 gap-4 px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors cursor-pointer',
                  index !== currentData.entries.length - 1 && 'border-b border-neutral-100'
                )}
              >
                {period !== 'today' && 'date' in entry && (
                  <div className="col-span-1 text-xs text-neutral-400">{entry.date}</div>
                )}
                <div className={cn('text-neutral-900 truncate', period === 'today' ? 'col-span-5' : 'col-span-4')}>
                  {entry.task}
                </div>
                <div className="col-span-3 text-neutral-500 truncate">{entry.project || '—'}</div>
                {period === 'today' && 'time' in entry && (
                  <div className="col-span-2 text-xs text-neutral-400">{entry.time}</div>
                )}
                <div className="col-span-1 text-right tabular-nums">{entry.duration}</div>
                <div className="col-span-1 text-right">
                  {entry.billable ? (
                    <span className="text-xs text-emerald-600">Billable</span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </div>
              </div>
            ))}

            {/* Totals row */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 border-t border-neutral-200 bg-stone-50 text-sm">
              {period !== 'today' && <div className="col-span-1" />}
              <div className={period === 'today' ? 'col-span-5' : 'col-span-4'}>Total</div>
              <div className="col-span-3" />
              {period === 'today' && <div className="col-span-2" />}
              <div className="col-span-1 text-right tabular-nums">{currentData.totalHours}</div>
              <div className="col-span-1 text-right text-emerald-600 text-xs">{currentData.billableHours}</div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-4">
          {/* Active Timer */}
          {activeTimer.isRunning && (
            <div className="bg-white rounded-lg border border-neutral-200 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-sage-50/60 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-600" />
                    </span>
                    <span className="text-xs font-medium text-neutral-900">Recording</span>
                  </div>
                  <span className="text-xl font-medium text-neutral-900 tabular-nums">{activeTimer.elapsed}</span>
                </div>
                <p className="text-sm text-neutral-900 truncate">{activeTimer.task}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-neutral-500">{activeTimer.project}</span>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                    <Square className="w-3 h-3" />
                    Stop
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Log Time */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <h3 className="text-xs font-medium text-neutral-500 mb-3">Log Time</h3>
            <div className="space-y-2">
              <Input
                placeholder="What did you work on?"
                value={quickLogDescription}
                onChange={(e) => setQuickLogDescription(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex-1 h-8 px-2 text-xs bg-white border border-neutral-200 rounded-md flex items-center justify-between hover:border-neutral-300 transition-colors">
                      <span className={selectedProject ? 'text-neutral-900' : 'text-neutral-400'}>
                        {selectedProject || 'Project'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-neutral-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[180px]">
                    {projects.map((project) => (
                      <DropdownMenuItem key={project} onClick={() => setSelectedProject(project)} className="text-sm">
                        {project}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input
                  placeholder="0h 0m"
                  value={quickLogDuration}
                  onChange={(e) => setQuickLogDuration(e.target.value)}
                  className="w-16 h-8 text-xs text-center"
                />
                <Button size="sm" className="h-8 px-3 text-xs bg-umber-900 text-white hover:bg-umber-800">Log</Button>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <h3 className="text-xs font-medium text-neutral-500 mb-3">Recent Projects</h3>
            <div className="space-y-2">
              {[
                { name: 'Hampstead Townhouse', hours: '12.5h', color: 'bg-sage-500' },
                { name: 'Chelsea Penthouse', hours: '8.25h', color: 'bg-ochre-500' },
                { name: 'Soho Members Club', hours: '6h', color: 'bg-terracotta-500' },
              ].map((project) => (
                <button
                  key={project.name}
                  onClick={() => setSelectedProject(project.name)}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-stone-50 transition-colors text-left"
                >
                  <span className={cn('w-2 h-2 rounded-full shrink-0', project.color)} />
                  <span className="text-sm text-neutral-900 flex-1 truncate">{project.name}</span>
                  <span className="text-xs text-neutral-400 tabular-nums">{project.hours}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
