'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import React, { useState, useMemo } from 'react';
import useFetch from '@/hooks/useFetch';
import { useParams, useRouter } from 'next/navigation';
import { PhaseTimeLogsResponse } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import ExportButton from '@/components/ui/ExportButton';
import { Pie, PieChart, Cell, Legend, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useCurrency } from '@/lib/getCurrencySymbol';
import { useTranslations } from 'next-intl';

const PhaseDetailsPageContent = () => {
    const t = useTranslations('reportsPhasePage');
    const tc = useTranslations('common');
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    
    const { data, isLoading, error } = useFetch(id ? `/reports/phase-timelogs/${id}/` : null);
    const phaseData = data as PhaseTimeLogsResponse;
    const { currency } = useCurrency(phaseData?.currency || '');

    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState('all');

    const uniqueUsers = useMemo(() => {
        if (!phaseData?.timelogs) return [];
        const users = new Set(phaseData.timelogs.map(log => log.user_name));
        return Array.from(users).sort();
    }, [phaseData]);

    const filteredLogs = useMemo(() => {
        if (!phaseData?.timelogs) return [];
        return phaseData.timelogs.filter(log => {
            const matchesSearch = log.task_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesUser = userFilter === 'all' || log.user_name === userFilter;
            return matchesSearch && matchesUser;
        });
    }, [phaseData, searchQuery, userFilter]);

    const exportData = useMemo(() => {
        if (!phaseData?.timelogs) return [];
        return phaseData.timelogs.map(log => ({
            'Log ID': log.log_id,
            'Date': log.created_at,
            'User': log.user_name,
            'Task': log.task_name,
            'Description': log.description,
            'Duration': log.duration.formatted,
            'Duration Hours': parseFloat((log.total_seconds / 3600).toFixed(2)),
            'Cost': log.cost || 0,
            'Currency': log.currency || 'GBP'
        }));
    }, [phaseData]);

    const COLORS = ['#94A88C', '#A59F96', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#C084FC', '#34D399'];

    // Pie chart data - grouped by user
    const pieChartData = useMemo(() => {
        if (!phaseData?.timelogs) return [];
        const userMap = new Map();
        
        phaseData.timelogs.forEach(log => {
            const existing = userMap.get(log.user_name);
            if (existing) {
                existing.value += log.total_seconds;
                existing.cost += log.cost || 0;
            } else {
                userMap.set(log.user_name, {
                    name: log.user_name,
                    value: log.total_seconds,
                    cost: log.cost || 0
                });
            }
        });

        return Array.from(userMap.values()).map((user, index) => ({
            name: user.name,
            value: parseFloat((user.value / 3600).toFixed(2)), // Convert to hours
            hours: `${Math.floor(user.value / 3600)}h ${Math.floor((user.value % 3600) / 60)}m`,
            cost: user.cost,
            fill: COLORS[index % COLORS.length]
        }));
    }, [phaseData]);

    // Bar chart data - by task
    const barChartData = useMemo(() => {
        if (!phaseData?.timelogs) return [];
        const taskMap = new Map();
        
        phaseData.timelogs.forEach(log => {
            const existing = taskMap.get(log.task_name);
            if (existing) {
                existing.hours += log.total_seconds / 3600;
                existing.cost += log.cost || 0;
            } else {
                taskMap.set(log.task_name, {
                    task: log.task_name,
                    hours: log.total_seconds / 3600,
                    cost: log.cost || 0,
                    time: `${log.duration.hours}h ${log.duration.minutes}m ${log.duration.seconds}s`
                });
            }
        });

        return Array.from(taskMap.values())
            .map(task => ({
                task: task.task,
                hours: parseFloat(task.hours.toFixed(2)),
                cost: parseFloat(task.cost.toFixed(2))
            }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 10); // Top 10 tasks
    }, [phaseData]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-7xl space-y-4">
                 <Skeleton className="h-10 w-32" />
                 <Skeleton className="h-[200px] w-full" />
            </div>
        );
    }

    if (error) {
        return (
             <div className="container mx-auto py-8 px-4 max-w-7xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
                </Button>
                <div className="text-red-500">Failed to load phase details. Please try again later.</div>
             </div>
        );
    }

    if (!phaseData) {
         return (
             <div className="container mx-auto py-8 px-4 max-w-7xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
                </Button>
                <div className="text-muted-foreground">No data found.</div>
             </div>
        );
    }

    return (
        <div className="flex-1 bg-stone-50 p-6 sm:p-6 ">
            {/* <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
            </Button>
            
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h1 className="text-xl font-semibold text-gray-900">{phaseData.phase_name}</h1>
                   <p className="text-muted-foreground mt-1">Detailed time logs for this phase.</p>
                </div>
              
            </div> */}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('searchTasks')}
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <Select value={userFilter} onValueChange={setUserFilter}>
                        <SelectTrigger>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder={t('filterUser')} />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allUsers')}</SelectItem>
                            {uniqueUsers.map(user => (
                                <SelectItem key={user} value={user}>{user}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                  <ExportButton 
                     data={exportData}
                     filename={`Phase_Report_${phaseData.phase_name.replace(/\s+/g, '_')}`}
                     sheetName="TimeLogs"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Pie Chart - Time by User */}
                {pieChartData.length > 0 && (
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('timeByUser')}</CardTitle>
                            <CardDescription>{t('timeByUserSub')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            label={false}
                                            outerRadius={110}
                                            fill="#8884d8"
                                            dataKey="value"
                                            paddingAngle={2}
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.fill}
                                                    className="stroke-background"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                                            <p className="font-semibold capitalize text-sm mb-2">{data.name}</p>
                                                            <div className="space-y-1 text-xs">
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-medium">Time:</span> {data.hours}
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-medium">Cost:</span> {currency?.symbol}{data.cost.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend 
                                            layout="horizontal"
                                            align="center"
                                            verticalAlign="bottom"
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            content={({ payload }) => (
                                                <div className="flex flex-wrap justify-center gap-3 max-w-full px-4">
                                                    {payload?.map((entry, index) => {
                                                        const data = pieChartData[index];
                                                        return (
                                                            <div 
                                                                key={`legend-${index}`} 
                                                                className="flex items-center gap-2 p-2 rounded-md"
                                                            >
                                                                <div 
                                                                    className="w-3 h-3 rounded-full flex-shrink-0" 
                                                                    style={{ backgroundColor: entry.color }}
                                                                />
                                                                <span className="font-medium capitalize text-xs">{data.name}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bar Chart - Time by Task */}
                {barChartData.length > 0 && (
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('timeByTask')}</CardTitle>
                            <CardDescription>{t('timeByTaskSub')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                        <XAxis 
                                            dataKey="task" 
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            interval={0}
                                            tick={{ fontSize: 12 }}
                                            className="capitalize"
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => `${value}h`}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                                            <p className="font-semibold capitalize text-sm mb-2">{data.task}</p>
                                                            <div className="space-y-1 text-xs">
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-medium">Hours:</span> {data.hours}h
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-medium">Cost:</span> {currency?.symbol}{data.cost.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar 
                                            dataKey="hours" 
                                            fill="#94A88C" 
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>{t('timeLogs')}</CardTitle>
                    <CardDescription>
                        {filteredLogs.length} entries found
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 scrollbar scrollbar-thin">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('date')}</TableHead>
                                <TableHead>{t('user')}</TableHead>
                                <TableHead>{t('task')}</TableHead>
                                <TableHead>{t('description')}</TableHead>
                                <TableHead>{t('cost')}</TableHead>
                                <TableHead className="text-right">Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.log_id}>
                                        <TableCell className="font-medium whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                                        <TableCell>{log.user_name}</TableCell>
                                        <TableCell className="capitalize">{log.task_name}</TableCell>
                                        <TableCell className="max-w-md truncate text-muted-foreground" title={log.description}>{log.description || '-'}</TableCell>
                                        <TableCell className="">
                                            <ViewCurrencySymbol code={phaseData?.currency || ''}/>
                                            {log.cost}</TableCell>
                                        <TableCell className="text-right">{log.duration.hours}h {log.duration.minutes}m {log.duration.seconds}s</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No logs found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

const PhaseDetailsPage = () => (
  <PermissionGuard permission="reports.view" redirectTo="/reports">
    <PhaseDetailsPageContent />
  </PermissionGuard>
);

export default PhaseDetailsPage;
