'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle2,
  Circle,
  Sparkles,
  Paintbrush,
  ShieldCheck,
  Milestone,
  ArrowRight,
  Loader2,
  Compass
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import useFetch from '@/hooks/useFetch';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslations } from 'next-intl';

dayjs.extend(relativeTime);

// AI Components
import { DailyBriefHero } from '@/components/ai/DailyBriefHero';

// Scope toggle for owners/admins
function ScopeToggle({ scope, onScopeChange, canSeeStudio }: { scope: string, onScopeChange: (s: string) => void, canSeeStudio: boolean }) {
  const t = useTranslations('dashboardPage');
  if (!canSeeStudio) return null;

  return (
    <div className="flex items-center gap-1 bg-muted/75 border border-border/30 rounded-xl p-1 shadow-sm">
      <button
        onClick={() => onScopeChange('my')}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          scope === 'my'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {t('myView')}
      </button>
      <button
        onClick={() => onScopeChange('studio')}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          scope === 'studio'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {t('studioView')}
      </button>
    </div>
  );
}

// Workspace Setup Tour Card
function WorkspaceTourCard() {
  const t = useTranslations('dashboardPage');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('focuspilot_onboarding_steps');
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      } else {
        // Default values representing initial configuration
        const defaults = {
          inbox: true,
          theme: true,
          team: false,
          project: true
        };
        setCompletedSteps(defaults);
        localStorage.setItem('focuspilot_onboarding_steps', JSON.stringify(defaults));
      }
    }
  }, []);

  const toggleStep = (stepId: string) => {
    const updated = { ...completedSteps, [stepId]: !completedSteps[stepId] };
    setCompletedSteps(updated);
    localStorage.setItem('focuspilot_onboarding_steps', JSON.stringify(updated));
  };

  const steps = [
    {
      id: 'inbox',
      title: t('tour.connectInboxTitle'),
      desc: t('tour.connectInboxDesc'),
      icon: Sparkles,
      link: '/ai/inbox',
      btnLabel: t('tour.goToInbox')
    },
    {
      id: 'theme',
      title: t('tour.personalizeThemeTitle'),
      desc: t('tour.personalizeThemeDesc'),
      icon: Paintbrush,
      link: '/settings/user/appearance',
      btnLabel: t('tour.customizeTheme')
    },
    {
      id: 'team',
      title: t('tour.inviteTeamTitle'),
      desc: t('tour.inviteTeamDesc'),
      icon: ShieldCheck,
      link: '/projects',
      btnLabel: t('tour.onboardTeam')
    },
    {
      id: 'project',
      title: t('tour.firstProjectTitle'),
      desc: t('tour.firstProjectDesc'),
      icon: Milestone,
      link: '/projects',
      btnLabel: t('tour.launchProjects')
    }
  ];

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border border-border/40 bg-card shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary animate-pulse" /> {t('tour.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {t('tour.subtitle')}
          </p>
        </div>
        <div className="flex flex-col gap-1 items-end min-w-[220px]">
          <div className="flex justify-between w-full text-xs font-semibold text-foreground/80">
            <span>{t('tour.setupMilestones')}</span>
            <span>{completedCount}/{steps.length} {t('tour.completed')}</span>
          </div>
          <Progress value={progressPercent} className="w-full h-2 rounded-full bg-muted mt-1.5 [&>div]:bg-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = !!completedSteps[step.id];
          return (
            <div
              key={step.id}
              className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 ${
                isDone
                  ? 'bg-muted/20 border-border/20 text-foreground/75'
                  : 'bg-card border-border/50 hover:border-border hover:shadow-sm text-foreground'
              }`}
            >
              {/* Checkbox button */}
              <button
                onClick={() => toggleStep(step.id)}
                className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/60" />
                )}
              </button>

              <div className="flex items-center gap-2.5 mb-2.5">
                <div className={`p-2 rounded-lg shrink-0 ${isDone ? 'bg-primary/5 text-primary/70' : 'bg-primary/10 text-primary'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className={`text-sm font-semibold truncate pr-6 ${isDone ? 'text-foreground/70 line-through' : 'text-foreground'}`}>
                  {step.title}
                </h4>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4 pr-1">
                {step.desc}
              </p>

              <Link
                href={step.link}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:underline mt-auto ${
                  isDone ? 'text-primary/70' : 'text-primary'
                }`}
              >
                {step.btnLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Today's Meetings Card
function TodaysMeetingsCard({ meetings = [] }: { scope: string, meetings: any[] }) {
  const t = useTranslations('dashboardPage');
  const displayMeetings = meetings;

  const formatMeetingTime = (start: string, end: string) => {
    if (start.length === 10) return t('allDay');

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
      return `${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`;
    } catch (e) {
      return t('invalidTime');
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent justify-between">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl shadow-inner">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-foreground text-sm sm:text-base tracking-tight">{t('todaysMeetings')}</h3>
          </div>
          {displayMeetings?.length > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
              {displayMeetings.length}
            </Badge>
          )}
        </div>
        <div className="space-y-2.5 flex-grow overflow-x-hidden overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
          {displayMeetings?.length > 0 ? (
            displayMeetings.slice(0, 4).map((meeting, index) => (
              <Link
                key={meeting.id || index}
                href={meeting.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-between gap-3 p-3 rounded-xl border border-border/30 bg-gradient-to-r from-primary/[0.04] to-primary/[0.01] hover:border-primary/25 hover:from-primary/[0.08] hover:to-primary/[0.03] transition-all duration-300 hover:translate-x-1 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(var(--primary),0.05)] group pl-4"
              >
                {/* Vertical brand-primary line on left edge */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80 rounded-l-xl group-hover:bg-primary group-hover:w-1.5 transition-all duration-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                    {meeting.summary}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    {formatMeetingTime(meeting.start_time, meeting.end_time)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/40 rounded-xl p-5 text-center bg-muted/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="p-3 bg-muted/20 rounded-full mb-3 border border-border/20 shadow-inner">
                <Calendar className="h-7 w-7 text-muted-foreground/60" />
              </div>
              <p className="text-foreground font-bold text-sm">{t('scheduleClear')}</p>
              <p className="text-muted-foreground text-xs mt-1 max-w-[180px] leading-relaxed">{t('scheduleClearDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboardPage');
  const { user } = useUser();
  const { data: dashboardInfo } = useFetch('user/dashboard/');
  const { data: dailyBrief, refetch, isLoading } = useFetch('user/daily-brief/');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = 'Home | Focuspilot';
  }, []);

  const handleRegenerateBrief = async () => {
    setIsRegenerating(true);
    await refetch();
    setIsRegenerating(false);
  };

  const [scope, setScope] = useState(() => {
    return 'my';
  });

  const canSeeStudio = false;

  const getGreeting = () => {
    return dashboardInfo?.greeting?.greeting || t('goodMorning');
  };

  // Overdue Tasks Card
  function OverdueTasksCard({ overdueData = null }: { overdueData: any }) {
    const tasks = overdueData?.tasks || [];

    return (
      <div className="h-full flex flex-col bg-transparent justify-between">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl shadow-inner">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-foreground text-sm sm:text-base tracking-tight">{t('overdueTasks')}</h3>
            </div>
            <Badge className="bg-destructive/15 text-destructive border border-destructive/25 text-xs font-bold rounded-full px-2.5 py-0.5 shadow-sm">
              {overdueData?.count || 0}
            </Badge>
          </div>
          <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {tasks?.length > 0 ? (
              tasks.slice(0, 4).map((task: any, index: number) => (
                <div 
                  key={index} 
                  className="relative flex items-center justify-between gap-3 p-3 rounded-xl border border-border/30 bg-gradient-to-r from-destructive/[0.04] to-destructive/[0.01] hover:border-destructive/25 hover:from-destructive/[0.08] hover:to-destructive/[0.03] transition-all duration-300 hover:translate-x-1 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(239,68,68,0.03)] group pl-4"
                >
                  {/* Vertical brand-destructive line on left edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/70 rounded-l-xl group-hover:bg-destructive group-hover:w-1.5 transition-all duration-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold capitalize text-foreground truncate group-hover:text-destructive transition-colors duration-200">
                      {task.title || task.name}
                    </p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-[10px] bg-destructive/5 text-destructive/85 border border-destructive/10 px-2 py-0.5 rounded-md font-semibold truncate max-w-[150px]">
                        {task.project || t('noProject')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/40 rounded-xl p-5 text-center bg-muted/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-full mb-3 shadow-sm animate-pulse">
                  <CheckCircle2 className="h-7 w-7 text-primary fill-primary/10" />
                </div>
                <p className="text-foreground font-bold text-sm">{t('allCaughtUp')}</p>
                <p className="text-muted-foreground text-xs mt-1 max-w-[180px] leading-relaxed">{t('allCaughtUpDesc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Jump Back In (Recent Projects) Card
  function JumpBackInCard({ projects = [] }: { projects: any[] }) {
    return (
      <div className="h-full flex flex-col bg-transparent justify-between">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl shadow-inner">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-foreground text-sm sm:text-base tracking-tight">{t('jumpBackIn')}</h3>
          </div>
          <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {projects?.length > 0 ? (
              projects.slice(0, 4).map((project, index) => (
                <div
                  onClick={() => router.push(`/projects/${project?.id}`)}
                  key={index}
                  className="flex flex-col gap-3 p-3 rounded-xl border border-border/30 hover:border-primary/25 transition-all duration-300 hover:translate-x-1 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(var(--primary),0.04)] cursor-pointer bg-gradient-to-r from-primary/[0.04] to-primary/[0.01] hover:from-primary/[0.08] hover:to-primary/[0.03] group pl-4 relative"
                >
                  {/* Subtle indicator bar on project active states */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-xl group-hover:bg-primary group-hover:w-1.5 transition-all duration-300" />
                  
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                        {project.name}
                      </p>
                    </div>
                    <span className="text-[10px] bg-card/80 border border-border/50 px-2 py-0.5 rounded-full text-muted-foreground font-semibold capitalize shrink-0 shadow-sm">{project.pill || t('project')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-0.5">
                    {/* Custom high-end glass progress bar */}
                    <div className="h-2 w-full bg-muted/60 border border-border/30 rounded-full overflow-hidden flex-1 p-[1px] relative shadow-inner">
                      <div 
                        style={{ width: `${project.progress || 0}%` }} 
                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_6px_rgba(var(--primary),0.3)] transition-all duration-500 ease-out" 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-foreground/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full min-w-[38px] text-center shrink-0">{project.progress || 0}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/40 rounded-xl p-5 text-center bg-muted/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="p-3 bg-muted/20 rounded-full mb-3 border border-border/20 shadow-inner">
                  <TrendingUp className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <p className="text-foreground font-bold text-sm">{t('noRecentBoards')}</p>
                <p className="text-muted-foreground text-xs mt-1 max-w-[180px] leading-relaxed">{t('noRecentBoardsDesc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Time Tracked productivity Card
  function TimeTrackedCard({ timeData = null }: { timeData: any }) {
    return (
      <div className="h-full flex flex-col bg-transparent justify-between">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl shadow-inner">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-foreground text-sm sm:text-base tracking-tight">{t('timeTracked')}</h3>
            </div>
            
            <div className="bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/25 rounded-2xl p-4 flex items-center justify-between mb-4 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <p className="text-2xl font-black text-foreground tracking-tight leading-none">{timeData?.total_hours || '0h 0m'}</p>
                <p className="text-[10px] font-bold text-primary tracking-wider uppercase mt-1">{t('productiveHours')}</p>
              </div>
              <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[110px] pr-1 scrollbar-thin">
            {timeData?.breakdown && Object.entries(timeData.breakdown).map(([day, hours]: [string, any], index: number) => {
              const calcHours = Number(hours?.calc_hours || 0);
              const percent = Math.min((calcHours / 10) * 100, 100);
              return (
                <div key={index} className="flex items-center justify-between gap-3 group/row py-0.5 hover:bg-muted/10 rounded px-1 transition-colors duration-200">
                  <span className="text-[10px] font-bold w-[32px] text-muted-foreground uppercase group-hover/row:text-primary transition-colors">{day}</span>
                  <div className="flex-1 flex items-center">
                    {/* Custom High-end micro progress track */}
                    <div className="h-2 w-full bg-muted/60 border border-border/30 rounded-full overflow-hidden p-[1px] relative shadow-inner group-hover/row:border-primary/20 transition-all duration-300">
                      <div 
                        style={{ width: `${percent}%` }} 
                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_8px_rgba(var(--primary),0.35)] transition-all duration-500 ease-out group-hover/row:brightness-110" 
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-foreground/80 bg-card border border-border/40 px-1.5 py-0.5 rounded-md min-w-[42px] text-right shrink-0 shadow-sm group-hover/row:border-primary/25 transition-colors">{hours?.time || '0h'}</span>
                </div>
              );
            })}
          </div>
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
    <div className="flex-1 pb-8 min-h-0 bg-stone-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex flex-col min-h-0">

        {/* AI Daily Brief Hero Section */}
        <section>
          <DailyBriefHero
            brief={dailyBrief?.daily_brief}
            userName={dashboardInfo?.greeting?.name || user?.name || t('there')}
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

        {/* Dashboard Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 bg-card/65 backdrop-blur-md border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl h-[335px] flex flex-col justify-between">
            <TodaysMeetingsCard scope={scope} meetings={dashboardInfo?.today_meetings} />
          </Card>
          <Card className="p-5 bg-card/65 backdrop-blur-md border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl h-[335px] flex flex-col justify-between">
            <OverdueTasksCard overdueData={dashboardInfo?.overdue_tasks} />
          </Card>
          <Card className="p-5 bg-card/65 backdrop-blur-md border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl h-[335px] flex flex-col justify-between">
            <JumpBackInCard projects={dashboardInfo?.jump_back_in} />
          </Card>
          <Card className="p-5 bg-card/65 backdrop-blur-md border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl h-[335px] flex flex-col justify-between">
            <TimeTrackedCard timeData={dashboardInfo?.time_tracked} />
          </Card>
        </section>

        {/* Premium Onboarding Setup Tour Card */}
        <section>
          <WorkspaceTourCard />
        </section>

      </div>
    </div>
  );
}
