'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import useFetch from '@/hooks/useFetch';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';
import { DailyBriefHero } from '@/components/ai/DailyBriefHero';
import { pageShellClassName } from '@/components/layout/page-shell';

dayjs.extend(relativeTime);

const dashboardCardClass = 'p-4 rounded-xl border border-border bg-card shadow-sm h-80';

function ScopeToggle({
  scope,
  onScopeChange,
  canSeeStudio,
}: {
  scope: string;
  onScopeChange: (s: string) => void;
  canSeeStudio: boolean;
}) {
  if (!canSeeStudio) return null;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
      {(['my', 'studio'] as const).map(value => (
        <button
          key={value}
          type="button"
          onClick={() => onScopeChange(value)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            scope === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {value === 'my' ? 'My View' : 'Studio View'}
        </button>
      ))}
    </div>
  );
}

function TodaysMeetingsCard({
  meetings = [],
}: {
  meetings: Array<{
    id?: string;
    link?: string;
    summary?: string;
    start_time?: string;
    end_time?: string;
  }>;
}) {
  const formatMeetingTime = (start: string, end: string) => {
    if (start.length === 10) return 'All Day';
    try {
      const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
      return `${new Date(start).toLocaleTimeString([], opts)} - ${new Date(end).toLocaleTimeString([], opts)}`;
    } catch {
      return 'Invalid Time';
    }
  };

  return (
    <div className="h-full flex flex-col text-card-foreground">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Today&apos;s Meetings</h3>
      </div>
      <div className="space-y-1 flex-1 overflow-y-auto">
        {meetings.length > 0 ? (
          meetings.slice(0, 4).map((meeting, index) => (
            <Link
              key={meeting.id || index}
              href={meeting.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group hover:bg-accent p-2 rounded-md transition-colors"
            >
              <div className="w-2 h-2 rounded-full shrink-0 bg-sage-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{meeting.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMeetingTime(meeting.start_time || '', meeting.end_time || '')}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium text-sm">No meetings today</p>
            <p className="text-muted-foreground/80 text-xs mt-1">No scheduled meetings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OverdueTasksCard({
  overdueData = null,
}: {
  overdueData: { count?: number; tasks?: Array<{ title?: string; name?: string; project?: string }> } | null;
}) {
  const tasks = overdueData?.tasks || [];

  return (
    <div className="h-full flex flex-col text-card-foreground">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-terracotta-500" />
        <h3 className="font-semibold text-foreground">Overdue Tasks</h3>
        <Badge className="bg-terracotta-500/15 text-terracotta-500 border border-terracotta-500/30 text-xs">
          {overdueData?.count || 0}
        </Badge>
      </div>
      <div className="space-y-3 flex-1">
        {tasks.length > 0 ? (
          tasks.slice(0, 5).map((task, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-terracotta-500 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize text-foreground truncate">
                  {task.title || task.name}
                </p>
                <p className="text-xs capitalize text-muted-foreground">{task.project || 'No Project'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No overdue tasks
          </div>
        )}
      </div>
    </div>
  );
}

function JumpBackInCard({
  projects = [],
}: {
  projects: Array<{ id?: number; name?: string; pill?: string; progress?: number }>;
}) {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col text-card-foreground">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Jump Back In</h3>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {projects.length > 0 ? (
          projects.slice(0, 4).map((project, index) => (
            <button
              type="button"
              key={index}
              onClick={() => router.push(`/projects/${project?.id}`)}
              className="flex w-full items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors text-left"
            >
              <div className="w-2 h-2 rounded-full shrink-0 bg-clay-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground capitalize">{project.pill || 'Project'}</span>
                  <span className="text-xs text-muted-foreground/80">{project.progress || 0}%</span>
                </div>
              </div>
              <Progress value={project.progress || 0} className="w-12 h-1 [&>div]:bg-clay-500" />
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TrendingUp className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No recent projects</p>
            <p className="text-xs text-muted-foreground mt-1">Your recent projects will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeTrackedCard({
  scope,
  timeData = null,
}: {
  scope: string;
  timeData: {
    total_hours?: number;
    breakdown?: Record<string, { calc_hours?: number; time?: string }>;
  } | null;
}) {
  if (scope === 'studio') {
    return (
      <div className="h-full flex flex-col text-card-foreground">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Team Capacity</h3>
        </div>
        <p className="text-sm text-muted-foreground">Studio view coming soon.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col text-card-foreground">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Time Tracked</h3>
      </div>
      <div className="space-y-4 flex-1">
        <div>
          <p className="text-xl font-semibold text-foreground">{timeData?.total_hours ?? 0}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
        <div className="space-y-2">
          {timeData?.breakdown &&
            Object.entries(timeData.breakdown).map(([day, hours], index) => (
              <div key={index} className="flex items-center justify-between gap-2">
                <span className="text-sm w-[30px] text-muted-foreground">{day}</span>
                <Progress value={(Number(hours?.calc_hours) / 10) * 100} className="h-1 flex-1 [&>div]:bg-primary" />
                <span className="text-xs shrink-0 font-medium text-foreground w-16 text-right">{hours?.time}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const { data: dashboardInfo } = useFetch('user/dashboard/');
  const { data: dailyBrief, refetch, isLoading } = useFetch('user/daily-brief/');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [scope, setScope] = useState('my');

  useEffect(() => {
    document.title = 'Home | Focuspilot';
  }, []);

  const handleRegenerateBrief = async () => {
    setIsRegenerating(true);
    await refetch();
    setIsRegenerating(false);
  };

  const formattedDate =
    dashboardInfo?.greeting?.date ||
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={pageShellClassName}>
      <div className="max-w-7xl mx-auto space-y-6">
        <section>
          <DailyBriefHero
            brief={dailyBrief?.daily_brief}
            userName={dashboardInfo?.greeting?.name || user?.name || 'there'}
            greeting={dashboardInfo?.greeting?.greeting || 'Good morning'}
            date={formattedDate}
            onRegenerate={handleRegenerateBrief}
            isRegenerating={isRegenerating}
            isLoading={isLoading}
          />
        </section>

        {user?.isAdmin && (
          <div className="flex justify-end">
            <ScopeToggle scope={scope} onScopeChange={setScope} canSeeStudio={false} />
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className={dashboardCardClass}>
            <TodaysMeetingsCard meetings={dashboardInfo?.today_meetings ?? []} />
          </Card>
          <Card className={dashboardCardClass}>
            <OverdueTasksCard overdueData={dashboardInfo?.overdue_tasks} />
          </Card>
          <Card className={dashboardCardClass}>
            <JumpBackInCard projects={dashboardInfo?.jump_back_in ?? []} />
          </Card>
          <Card className={dashboardCardClass}>
            <TimeTrackedCard scope={scope} timeData={dashboardInfo?.time_tracked} />
          </Card>
        </section>
      </div>
    </div>
  );
}
