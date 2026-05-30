'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import React, { useState, useMemo } from 'react';
import useFetch from '@/hooks/useFetch';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { UserDetailedReportResponse } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import ExportButton from '@/components/ui/ExportButton';
import { useCurrency } from '@/lib/getCurrencySymbol';
import { useTranslations } from 'next-intl';

const UserDetailsPageContent = () => {
    const t = useTranslations('reportsTeamDetailPage');
    const params = useParams();
    const searchParams = useSearchParams();
    const userId = params.id;

    const paramStartDate = searchParams.get('start_date');
    const paramEndDate = searchParams.get('end_date');

    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState('all');

    const url = `/reports/user-detailed-report/${userId}/?start_date=${paramStartDate || ''}&end_date=${paramEndDate || ''}`;
    const { data, isLoading, error } = useFetch(userId ? url : null);
    const userData = data as UserDetailedReportResponse;
    const { currency } = useCurrency(userData?.currency || '');

    const uniqueProjects = useMemo(() => {
        if (!userData?.tasks) return [];
        const projects = new Set(userData.tasks.map(t => t.project_name));
        return Array.from(projects).sort();
    }, [userData]);

    const filteredTasks = useMemo(() => {
        if (!userData?.tasks) return [];
        return userData.tasks.filter(task => {
            const matchesSearch = task.task_title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProject = projectFilter === 'all' || task.project_name === projectFilter;
            return matchesSearch && matchesProject;
        });
    }, [userData, searchQuery, projectFilter]);

    const exportData = useMemo(() => {
        if (!userData?.tasks) return [];
        return userData.tasks.map(t => ({
            'Project': t.project_name,
            'Task': t.task_title,
            'Total Time': t.total_time.formatted,
            'Total Hours': parseFloat((t.total_seconds / 3600).toFixed(2)),
            'Cost': t.cost || 0,
            'Currency': userData.currency || 'GBP'
        }));
    }, [userData]);

    const projectStats = useMemo(() => {
        if (!userData?.tasks) return [];
        return uniqueProjects.map(project => {
            const tasks = userData.tasks.filter(t => t.project_name === project);
            const totalSecs = tasks.reduce((s, t) => s + t.total_seconds, 0);
            return {
                name: project,
                totalSecs,
                h: Math.floor(totalSecs / 3600),
                m: Math.floor((totalSecs % 3600) / 60),
                taskCount: tasks.length,
            };
        }).sort((a, b) => b.totalSecs - a.totalSecs);
    }, [userData, uniqueProjects]);

    if (isLoading) {
        return (
            <main className="flex-1 bg-stone-50 p-6">
                <div className="max-w-7xl mx-auto space-y-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </main>
        );
    }

    if (error || !userData) {
        return (
            <main className="flex-1 bg-stone-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-muted-foreground">{t('noData')}</div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-stone-50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{userData.user_name}</h1>
                        <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                            <span>{t('total')} <span className="font-medium text-gray-900">{userData.user_total_time.hours}h {userData.user_total_time.minutes}m</span></span>
                            {userData.user_total_cost !== undefined && (
                                <span>{t('cost')} <span className="font-medium text-gray-900"><ViewCurrencySymbol code={userData.currency || ''} />{userData.user_total_cost.toLocaleString()}</span></span>
                            )}
                            {paramStartDate && paramEndDate && (
                                <span className="text-xs border border-gray-200 rounded-full px-2 py-0.5 bg-white">{paramStartDate} → {paramEndDate}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search + Export */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={t('searchTasks')}
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ExportButton
                        data={exportData}
                        filename={`User_Details_${userData.user_name.replace(/\s+/g, '_')}`}
                        sheetName="Tasks"
                    />
                </div>

                {/* Two-panel layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Projects */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-gray-900">{t('projects')}</CardTitle>
                                <CardDescription>{t('projectsCount', { count: uniqueProjects.length })}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    <button
                                        onClick={() => setProjectFilter('all')}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left ${projectFilter === 'all' ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700'}`}
                                    >
                                        <span>{t('allProjects')}</span>
                                        <span className="text-xs text-gray-500 font-medium">{userData.user_total_time.hours}h {userData.user_total_time.minutes}m</span>
                                    </button>
                                    {projectStats.map(proj => (
                                        <button
                                            key={proj.name}
                                            onClick={() => setProjectFilter(proj.name)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left ${projectFilter === proj.name ? 'bg-gray-50 font-semibold text-gray-900 border-l-2 border-gray-900' : 'text-gray-700'}`}
                                        >
                                            <span className="truncate pr-2">{proj.name}</span>
                                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{proj.h}h {proj.m}m</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT: Tasks */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-gray-900">
                                    {projectFilter === 'all' ? t('allTasks') : projectFilter}
                                </CardTitle>
                                <CardDescription>{t('tasksCount', { count: filteredTasks.length })}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            {projectFilter === 'all' && <TableHead className="text-xs font-medium text-gray-600">{t('projects')}</TableHead>}
                                            <TableHead className="text-xs font-medium text-gray-600">{t('task')}</TableHead>
                                            <TableHead className="text-right text-xs font-medium text-gray-600">{t('cost')}</TableHead>
                                            <TableHead className="text-right text-xs font-medium text-gray-600 whitespace-nowrap">{t('time')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTasks.length > 0 ? (
                                            filteredTasks.map(task => (
                                                <TableRow key={task.task_id} className="hover:bg-gray-50">
                                                    {projectFilter === 'all' && <TableCell className="text-sm text-gray-500 py-3">{task.project_name}</TableCell>}
                                                    <TableCell className="text-sm text-gray-900 py-3">{task.task_title}</TableCell>
                                                    <TableCell className="text-right text-sm py-3">
                                                        {task.cost !== undefined && task.cost > 0 ? <><ViewCurrencySymbol code={userData.currency || ''} />{task.cost.toLocaleString()}</> : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm py-3 whitespace-nowrap">{task.total_time.hours}h {task.total_time.minutes}m</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-sm text-gray-500">{t('noTasksFound')}</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </main>
    );
};

const UserDetailsPage = () => (
  <PermissionGuard permission="reports.view" redirectTo="/reports">
    <UserDetailsPageContent />
  </PermissionGuard>
);

export default UserDetailsPage;
