'use client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Download } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { downloadExcel } from 'react-export-table-to-excel';
import { ChartCard } from './chart-card';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

const MemberProjectBreakdown = ({ trackingData, trackingLoading, user, month }: any) => {
  const t = useTranslations('reportsMemberBreakdown');
  const [trackedProject, setTrackedProject] = useState<any[]>([]);
  const [customLoading, setCustomLoading] = useState(true);
  const [totalItem, setTotalItem] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');

  
  const project = []
  const data = []

  function getFormattedTimeForCurrentMonth(tasks: any[]) {
    if (!tasks) return;
    const now = new Date();

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    const totalMs = (tasks as any[]).reduce((total: number, task: any) => {
      if (!Array.isArray(task.session)) return total;

      const sessionTime = (task.session as any[]).reduce((sum: number, session: any) => {
        const sessionDate = new Date(session.date);
        if (sessionDate >= firstDay && sessionDate <= lastDay && typeof session.totalTime === 'number') {
          return sum + session.totalTime;
        }
        return sum;
      }, 0);

      return total + sessionTime;
    }, 0);

    const totalMinutes = totalMs / (1000 * 60);

    const totalHours = totalMinutes / 60;

    return totalHours;
  }

  function getFormattedTimeForAllTime(tasks: any[]) {
    if (!tasks) return;

    const totalMs = (tasks as any[])?.reduce((total: number, task: any) => {
      if (!Array.isArray(task.session)) return total;

      const sessionTime = (task.session as any[])?.reduce((sum: number, session: any) => {
        if (typeof session.totalTime === 'number') {
          return sum + session.totalTime;
        }
        return sum;
      }, 0);

      return total + sessionTime;
    }, 0);

    const totalMinutes = totalMs / (1000 * 60);
    const totalHours = totalMinutes / 60;

    return totalHours;
  }

  function getTrackingByUser(email: string) {
    const filterByEmail = (trackingData as any[])?.filter((item: any) => item.creator == email);
    // const filterByEmail = trackingData;
    return filterByEmail;
  }


  function logAugustSessions() {
    const tasks = getTrackingByUser(user?.email);
    const monthParam = month; // e.g. "2025-08" or "undefined"
    const now = new Date();

    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    // Use month from query if valid
    if (typeof monthParam === 'string' && /^\d{4}-\d{2}$/.test(monthParam) && monthParam !== 'undefined') {
      const [y, m] = monthParam.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        year = y;
        monthIndex = m - 1; // month is 0-based
      }
    }

    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Collect all valid sessions in chosen month
    const allSessions = (tasks as any[])
      .flatMap((task: any) =>
        (task.session || []).map((session: any) => ({
          task_id: task?.task?.id || 'Studio Task',
          project_id: task?.task?.projectID || 'Studio Project',
          date: new Date(session.date),
          totalTime: session?.totalTime,
          rate: task?.rate || null,
        }))
      )
      .filter((s: any) => s.date >= monthStart && s.date <= monthEnd);

    // Sort by date
    allSessions.sort((a: any, b: any) => a.date - b.date);

    // Format for console
    const formatted = allSessions.map((s: any) => {
      const taskName = (data as any)?.data?.find((t: any) => t.id === s.task_id)?.name || s.task_id;
      const projectName = (project as any)?.find((p: any) => p.id === s.project_id)?.name || s.project_id;

      return {
        date: s.date.toLocaleDateString('en-GB'), // dd/mm/yyyy
        task_id: taskName,
        project_id: projectName,
        rate: s.rate ? `£${s.rate} p/h` : '-',
        hours: typeof s.totalTime === 'number' ? (s.totalTime / (1000 * 60 * 60)).toFixed(2) : '-',
      };
    });

    return formatted;
  }

  function getUserProjectsWithTime(user: any, projects: any) {
    if (!user || !projects) return [];
    const userEmail = user?.email;
    const userTracking = getTrackingByUser(userEmail);
    const result: any[] = [];

    // Studio Management tracking
    // const studioTask = (userTracking as any[])?.filter((track: any) => track?.task == null) || [];
    // const totalStudioWorkTime = getFormattedTimeForCurrentMonth(studioTask);

    // if (totalStudioWorkTime) {
    //   result.push({
    //     projectID: null,
    //     projectName: 'Studio Management',
    //     totalTime: totalStudioWorkTime,
    //   });
    // }

    (projects as any[]).forEach((project: any) => {
      // const isAssigned = project.assigned?.some(assignee => assignee.email === userEmail);
      if (true) {
        const projectTracking = (userTracking as any[])?.filter((track: any) => track?.task?.projectID === project.id) || [];
        const totalTime = getFormattedTimeForAllTime(projectTracking);
        if (totalTime) {
          result.push({
            projectID: project.id,
            projectName: project.name || 'Unnamed Project',
            totalTime,
          });
        }
      }
    });

    return result;
  }

  function logSpecificProjectTotalTime(user: any, projects: any) {
    const allProjects = getUserProjectsWithTime(user, projects);
    const targetProject = allProjects.find(p => p.projectID === 'fbf5f7d0-7dbc-11f0-95e8-a1a6b244414d');

    if (targetProject) {
    } else {
    }
  }

  logSpecificProjectTotalTime(user, project);

  useEffect(() => {
    if (trackingLoading || !trackingData || isLoading) return;
    setTrackedProject(getUserProjectsWithTime(user, project));
    setCustomLoading(false);
    setTotalItem(logAugustSessions());
  }, [trackingData, trackingLoading, user, isLoading]);

  // derive project options from fetched projects and totalItem fallback
  const projectOptions = React.useMemo(() => {
    const opts: { id: string; name: string }[] = [];
    // use project data first (use name as id/value because totalItem.project_id stores names)
    if (project && Array.isArray(project)) {
      project.forEach(p => {
        const name = p.name || p.id;
        opts.push({ id: name, name });
      });
    }

    // include any project names from totalItem that may not be in project list
    (totalItem || []).forEach(it => {
      const exists = opts.find(o => o.id === it.project_id);
      if (!exists) opts.push({ id: it.project_id, name: it.project_id });
    });

    return opts;
  }, [project, totalItem]);

  // filtered items based on selectedProject; empty string => no filter
  const filteredItems = React.useMemo(() => {
    if (!selectedProject) return totalItem || [];
    return (totalItem || []).filter(
      it => it.project_id === selectedProject || (it.project_id === 'Studio Project' && selectedProject === 'Studio Project')
    );
  }, [selectedProject, totalItem]);

  const handleExport = () => {
    downloadExcel({
      fileName: 'My_Report',
      sheet: 'Employees Hours',
      tablePayload: {
        header: ['Date', 'Task Name', 'Project Name', 'Hours'],
        body: filteredItems.map(item => [item.date, item.task_id, item.project_id, item.hours]),
      },
    });
  };

  return (
    <Card className={cn('border-gray-200 bg-white')}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">{t('title')}</CardTitle>
            <CardDescription className="text-gray-600">{t('description')}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  {selectedProject || t('allProjects')} <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0">
                <Command>
                  <CommandInput placeholder={t('searchProjects')} />
                  <CommandList>
                    <CommandEmpty>
                      <p className="py-2 px-4 text-sm">{t('noProjectFound')}</p>
                    </CommandEmpty>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setSelectedProject('');
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${selectedProject === '' ? 'opacity-100' : 'opacity-0'}`} />
                      All projects
                    </CommandItem>
                    {projectOptions.map(opt => (
                      <CommandItem
                        key={opt.id}
                        value={opt.id}
                        onSelect={() => {
                          setSelectedProject(opt.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedProject === opt.id ? 'opacity-100' : 'opacity-0'}`} />
                        {opt.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> {t('export')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {' '}
        <div className="bg-white  overflow-scroll">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500  ">{t('date')}</th>
                <th className="px-6 py-4  text-sm text-center font-medium text-gray-500  ">{t('taskName')}</th>
                <th className="px-6 py-4  text-sm font-medium text-gray-500  ">{t('projectName')}</th>
                <th className="px-6 py-4  text-sm font-medium text-gray-500  ">{t('hoursLogged')}</th>
                <th className="px-6 py-4  text-sm font-medium text-gray-500  ">{t('percentTotal')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {!totalItem || trackingLoading || customLoading
                ? //
                  [...Array(7)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 mx-auto w-[80px] bg-white" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredItems?.map((item: any, index: number) => (
                    <tr key={`${item.date}-${index}`} className="border-b cursor-pointer border-gray-100 hover:bg-stone-50">
                      <td className="px-4 py-3 tabular-nums text-gray-900 text-left">{item?.date}</td>
                      <td className="px-6 py-4  whitespace-nowrap capitalize text-sm text-center text-gray-700">{item.task_id}</td>
                      <td className="px-4 py-3 tabular-nums text-gray-900 text-center">{item.project_id}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700">{item.hours}hrs</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">0</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberProjectBreakdown;
