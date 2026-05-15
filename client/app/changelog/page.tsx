'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Search, Sparkles, Bug, Zap, AlertTriangle, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import { cn } from '@/lib/utils';

type ChangeType = 'feature' | 'fix' | 'improvement' | 'breaking' | 'other';

interface ChangelogEntry {
  id: number;
  title: string;
  description: string;
  change_type: ChangeType;
  change_type_display: string;
  date: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface ChangelogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChangelogEntry[];
}

const CHANGE_TYPE_CONFIG: Record<ChangeType, { icon: typeof Sparkles; label: string; color: string; bgColor: string; borderColor: string }> = {
  feature: {
    icon: Sparkles,
    label: 'New Feature',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  fix: {
    icon: Bug,
    label: 'Bug Fix',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  improvement: {
    icon: Zap,
    label: 'Improvement',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  breaking: {
    icon: AlertTriangle,
    label: 'Breaking Change',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  other: {
    icon: MoreHorizontal,
    label: 'Other',
    color: 'text-gray-700',
    bgColor: 'bg-stone-50',
    borderColor: 'border-gray-200',
  },
};

function ChangeTypeBadge({ type }: { type: ChangeType }) {
  const config = CHANGE_TYPE_CONFIG[type] || CHANGE_TYPE_CONFIG.other;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.bgColor,
        config.color,
        config.borderColor
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function groupByMonth(entries: ChangelogEntry[]): Record<string, ChangelogEntry[]> {
  return entries.reduce((acc, entry) => {
    const monthKey = format(parseISO(entry.date), 'MMMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, ChangelogEntry[]>);
}

export default function ChangelogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(currentPage));
  queryParams.set('page_size', String(pageSize));
  if (changeTypeFilter !== 'all') {
    queryParams.set('change_type', changeTypeFilter);
  }

  const { data, isLoading } = useFetch<ChangelogResponse>(`changelog/?${queryParams.toString()}`);

  // Client-side search filtering
  const filteredResults = useMemo(() => {
    if (!data?.results) return [];
    if (!searchQuery.trim()) return data.results;

    const query = searchQuery.toLowerCase();
    return data.results.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query)
    );
  }, [data?.results, searchQuery]);

  const groupedEntries = useMemo(() => groupByMonth(filteredResults), [filteredResults]);
  const months = Object.keys(groupedEntries);

  const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Changelog</h1>
        <p className="text-base text-gray-500">
          New features, improvements, and fixes to TechStyles.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pb-6 border-b border-gray-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <Select
            value={changeTypeFilter}
            onValueChange={(value) => {
              setChangeTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All changes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All changes</SelectItem>
              <SelectItem value="feature">New Features</SelectItem>
              <SelectItem value="improvement">Improvements</SelectItem>
              <SelectItem value="fix">Bug Fixes</SelectItem>
              <SelectItem value="breaking">Breaking Changes</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-500">Loading changelog...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredResults.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No updates found</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Try adjusting your search or filters.' : 'Check back soon for updates.'}
          </p>
        </div>
      )}

      {/* Changelog Entries */}
      {!isLoading && months.length > 0 && (
        <div className="space-y-12">
          {months.map((month) => (
            <div key={month}>
              {/* Month Header */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                {month}
              </h2>

              {/* Entries for this month */}
              <div className="space-y-0 border-l-2 border-gray-100 ml-1">
                {groupedEntries[month].map((entry) => (
                  <div key={entry.id} className="relative pl-8 pb-8 last:pb-0">
                    {/* Timeline dot */}
                    <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-stone-300" />

                    {/* Entry Content */}
                    <div className="space-y-2">
                      {/* Date and Type */}
                      <div className="flex flex-wrap items-center gap-3">
                        <time className="text-sm text-gray-500">
                          {format(parseISO(entry.date), 'MMM d, yyyy')}
                        </time>
                        <ChangeTypeBadge type={entry.change_type} />
                      </div>

                      {/* Title */}
                      <Link
                        href={`/changelog/${entry.id}`}
                        className="block group"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                          {entry.title}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {entry.description}
                      </p>

                      {/* Read more link */}
                      <Link
                        href={`/changelog/${entry.id}`}
                        className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                      >
                        Read more
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && data && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.count)} of {data.count} updates
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!data.previous}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!data.next}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
