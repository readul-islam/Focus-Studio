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

dayjs.extend(relativeTime);

// AI Components
import { DailyBriefHero } from '@/components/ai/DailyBriefHero';
import { generateDailyBrief } from '@/app/ai/daily-brief/actions';
import type { DailyBrief } from '@/lib/ai/types';

// Scope toggle for owners/admins
function ScopeToggle({ scope, onScopeChange, canSeeStudio }) {
  if (!canSeeStudio) return null;

  return (
    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
      <button
        onClick={() => onScopeChange('my')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${scope === 'my' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
          }`}
      >
        My View
      </button>
      <button
        onClick={() => onScopeChange('studio')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${scope === 'studio' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
          }`}
      >
        Studio View
      </button>
    </div>
  );
}

// Dashboard card components with role-based data
function TodaysMeetingsCard({ scope, userRole, meetings = [] }: { scope: any, userRole: any, meetings: any[] }) {
  const displayMeetings = scope === 'studio' ? meetings : meetings;

  const formatMeetingTime = (start: string, end: string) => {
    // Check if it's a full date (YYYY-MM-DD) -> All Day
    if (start.length === 10) {
      return 'All Day';
    }

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
      const startTime = startDate.toLocaleTimeString([], timeOptions);
      const endTime = endDate.toLocaleTimeString([], timeOptions);

      return `${startTime} - ${endTime}`;
    } catch (e) {
      return 'Invalid Time';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-slatex-600" />
        <h3 className="font-semibold text-neutral-900">Today's Meetings</h3>
      </div>
      <div className="space-y-1 flex-1 overflow-x-hidden overflow-y-auto">
        {displayMeetings?.length > 0 ? (
          displayMeetings.slice(0, 4).map((meeting, index) => (
            <Link
              key={meeting.id || index}
              href={meeting.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group hover:bg-stone-50 p-2 rounded-md transition-colors"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-sage-500"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-sage-700 transition-colors">
                  {meeting.summary}
                </p>
                <p className="text-xs text-neutral-600">
                  {formatMeetingTime(meeting.start_time, meeting.end_time)}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-neutral-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-neutral-500 font-medium text-sm">No meetings today</p>
            <p className="text-neutral-400 text-xs mt-1">Relax! You don&apos;t have any scheduled meetings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [userTime] = useState(null);
  const { user } = useUser();
  const { data: dashboardInfo } = useFetch('user/dashboard/');
  const { data:dailyBrief , refetch ,isLoading } = useFetch('user/daily-brief/');
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    document.title = 'Home | Focuspilot';
  }, []);

  
  
const handleRegenerateBrief = async () => {
  setIsRegenerating(true);
  await refetch();
  setIsRegenerating(false);
}


  const router = useRouter();

  function JumpBackInCard({ scope, userRole, projects = [] }) {
    const displayProjects = scope === 'studio' ? projects : projects;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-slatex-600" />
          <h3 className="font-semibold text-neutral-900">Jump Back In</h3>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {displayProjects?.length > 0 ? (
            displayProjects.slice(0, 4).map((project, index) => (
              <div
                onClick={() => router.push(`/projects/${project?.id}`)}
                key={index}
                className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-md transition-colors cursor-pointer group"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-clay-500"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-clay-700 transition-colors">
                    {project.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-500 capitalize">{project.pill || 'Project'}</span>
                    <span className="text-xs text-neutral-400">{project.progress || 0}%</span>
                  </div>
                </div>
                <Progress
                  value={project.progress || 0}
                  className="w-12 h-1 [&>div]:bg-clay-500"
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <TrendingUp className="w-10 h-10 text-neutral-300 mb-3" />
              <p className="text-sm font-medium text-neutral-700">No recent projects</p>
              <p className="text-xs text-neutral-500 mt-1">Your recent projects will appear here</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function TimeTrackedCard({ scope, userRole, timeData = null }) {
    if (scope === 'studio') {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-slatex-600" />
            <h3 className="font-semibold text-neutral-900">Team Capacity</h3>
          </div>
          <div className="space-y-3 flex-1">
            {userTime?.slice(0, 6).map((member,index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-900">{member.name}</span>
                  <span className="text-neutral-600">{member.totalTime}h / 40h</span>
                </div>
                <Progress value={(member.totalTime / 40) * 100} className="h-1 [&>div]:bg-olive-600" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slatex-600" />
          <h3 className="font-semibold text-neutral-900">Time Tracked</h3>
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-xl font-semibold text-neutral-900">{timeData?.total_hours || 0}</p>
            <p className="text-xs text-neutral-600">This week</p>
          </div>
          <div className="space-y-2">
            {timeData?.breakdown && Object.entries(timeData.breakdown).map(([day, hours],index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm w-[30px] text-neutral-700">{day}</span>
                <div className="flex items-center gap-2 ml-3 flex-1">
                  <Progress value={(Number(hours?.calc_hours) / 10) * 100} className="h-1 w-full  [&>div]:bg-slatex-700" />

                </div>
                       <span className="text-xs flex-shrink-0 inline-block font-medium text-neutral-900 w-16 text-right">{hours?.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const [scope, setScope] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'my';
    }
    return 'my';
  });

  const canSeeStudio = false;

  const getGreeting = () => {
    return dashboardInfo?.greeting?.greeting || 'Good morning';
  };

  function OverdueTasksCard({ scope, userRole, overdueData = null }) {
    const tasks = overdueData?.tasks || [];

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-terracotta-600" />
          <h3 className="font-semibold text-neutral-900">Overdue Tasks</h3>
          <Badge className="bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30 text-xs">{overdueData?.count || 0}</Badge>
        </div>
        <div className="space-y-3 flex-1">
          {tasks?.length > 0 ? (
            tasks.slice(0, 5).map((task, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-terracotta-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize text-neutral-900 truncate">{task.title || task.name}</p>
                  <p className="text-xs capitalize text-neutral-600">
                    {task.project || 'No Project'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
              No overdue tasks
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get formatted date for British locale
  const formattedDate = dashboardInfo?.greeting?.date || new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0 space-y-6">

        {/* AI Daily Brief Hero Section */}
        <section>
          <DailyBriefHero
            brief={dailyBrief?.daily_brief}
            userName={dashboardInfo?.greeting?.name || user?.name || 'there'}
            greeting={getGreeting()}
            date={formattedDate}
            onRegenerate={handleRegenerateBrief}
            isRegenerating={isRegenerating}
            isLoading={isLoading}
          />
        </section>

        {/* Scope Toggle for Admins */}
        {user?.isAdmin && (
          <div className="flex justify-end">
            <ScopeToggle scope={scope} onScopeChange={setScope} canSeeStudio={canSeeStudio} />
          </div>
        )}

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <TodaysMeetingsCard scope={scope} userRole={user?.role} meetings={dashboardInfo?.today_meetings} />
          </Card>
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <OverdueTasksCard scope={scope} userRole={user?.role} overdueData={dashboardInfo?.overdue_tasks} />
          </Card>
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <JumpBackInCard scope={scope} userRole={user?.role} projects={dashboardInfo?.jump_back_in} />
          </Card>
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <TimeTrackedCard scope={scope} userRole={user?.role} timeData={dashboardInfo?.time_tracked} />
          </Card>
        </section>

      </div>
    </div>
  );
}
