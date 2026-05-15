import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import type { CalendarView, CalendarMode } from '@/hooks/calendar/useCalendarState';

interface CalendarToolbarProps {
  currentDate: Date;
  view: CalendarView;
  mode: CalendarMode;
  searchQuery: string;
  selectedScope: 'studio' | string;
  projectOptions: Array<{ id: string; name: string }>;
  enabledFilters: Set<'phases' | 'deliveries' | 'tasks'>;
  onViewChange: (view: CalendarView) => void;
  onModeChange: (mode: CalendarMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSearchChange: (query: string) => void;
  onScopeChange: (scope: string) => void;
  onToggleFilter: (filter: 'phases' | 'deliveries' | 'tasks') => void;
  extraActions?: React.ReactNode;
}

export function CalendarToolbar({
  currentDate,
  view,
  mode,
  searchQuery,
  selectedScope,
  projectOptions,
  enabledFilters,
  onViewChange,
  onModeChange,
  onPrev,
  onNext,
  onToday,
  onSearchChange,
  onScopeChange,
  onToggleFilter,
  extraActions,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0 flex-wrap gap-4">
      {/* Left Section: Mode & View Switchers */}
      <div className="flex items-center gap-4">
        {/* Scope Selector */}
        <Select value={selectedScope} onValueChange={onScopeChange}>
          <SelectTrigger className="w-[180px] h-9 bg-white border-gray-200">
            <SelectValue placeholder="Select scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="studio">Studio (All Projects)</SelectItem>
            {projectOptions.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mode Toggle */}
        <div className="bg-stone-100 p-1 rounded-lg flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onModeChange('calendar');
              onViewChange('month');
            }}
            className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${mode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Calendar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onModeChange('timeline')}
            className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${mode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Timeline
          </Button>
        </div>

        {/* View Buttons */}
        <div className="flex items-center border-gray-200">
          <div className="bg-stone-100 p-1 rounded-lg flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange('month')}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange('week')}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange('day')}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Day
            </Button>
          </div>
        </div>
      </div>

      {/* Center Section: Date Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-32 text-center select-none">
            {mode === 'timeline'
              ? view === 'day'
                ? format(currentDate, 'MMMM yyyy')
                : view === 'week'
                  ? format(currentDate, 'MMMM yyyy')
                  : format(currentDate, 'yyyy')
              : format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
      </div>

      {/* Right Section: Search, Filters & Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="h-9 w-64 pl-9 bg-stone-50 border-gray-200"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Checkboxes */}
        <div className="flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-phases"
              checked={enabledFilters.has('phases')}
              onCheckedChange={() => onToggleFilter('phases')}
            />
            <label htmlFor="filter-phases" className="text-sm font-medium cursor-pointer">
              Phases
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-deliveries"
              checked={enabledFilters.has('deliveries')}
              onCheckedChange={() => onToggleFilter('deliveries')}
            />
            <label htmlFor="filter-deliveries" className="text-sm font-medium cursor-pointer">
              Deliveries
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="filter-tasks" checked={enabledFilters.has('tasks')} onCheckedChange={() => onToggleFilter('tasks')} />
            <label htmlFor="filter-tasks" className="text-sm font-medium cursor-pointer">
              Tasks
            </label>
          </div>
        </div>

        {extraActions}
      </div>
    </div>
  );
}
