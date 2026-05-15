'use client';

import React, { useState, useMemo } from 'react';
import useFetch from '@/hooks/useFetch';
import { UserTimeReportResponse } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Timer, Users, DollarSign } from 'lucide-react';
import { ViewCurrencySymbol } from '../ViewCurrencySymbol';
import { KpiCard } from '@/components/reports/KpiCard';
import ExportButton from '@/components/ui/ExportButton';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserReportProps {
    externalStartDate?: string;
    externalEndDate?: string;
}

const UserReport = ({ externalStartDate, externalEndDate }: UserReportProps = {}) => {
    const router = useRouter();
    const [sortBy, setSortBy] = useState('time-desc');
    const [chartMetric, setChartMetric] = useState<'hours' | 'cost'>('hours');

    const formattedStartDate = externalStartDate || '';
    const formattedEndDate = externalEndDate || '';

    const url = `/reports/users-time-report/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
    const { data, isLoading } = useFetch(formattedStartDate && formattedEndDate ? url : '/reports/users-time-report/');
    const reportData = data as UserTimeReportResponse;

    const filteredUsers = useMemo(() => {
        if (!reportData?.users) return [];
        return [...reportData.users].sort((a, b) => {
            if (sortBy === 'time-desc') return b.total_seconds - a.total_seconds;
            if (sortBy === 'time-asc') return a.total_seconds - b.total_seconds;
            if (sortBy === 'cost-desc') return (b.cost || 0) - (a.cost || 0);
            if (sortBy === 'cost-asc') return (a.cost || 0) - (b.cost || 0);
            if (sortBy === 'name-asc') return a.user_name.localeCompare(b.user_name);
            if (sortBy === 'name-desc') return b.user_name.localeCompare(a.user_name);
            return 0;
        });
    }, [reportData, sortBy]);

    const chartData = useMemo(() => {
        if (!filteredUsers.length) return [];
        return filteredUsers.slice(0, 10).map(u => ({
            name: u.user_name.split(' ')[0],
            hours: parseFloat((u.total_seconds / 3600).toFixed(1)),
            cost: u.cost || 0,
        }));
    }, [filteredUsers]);

    const chartConfig = {
        hours: { label: 'Hours', color: '#94A88C' },
        cost: { label: 'Cost', color: '#A59F96' },
    };

    const exportData = useMemo(() => {
        if (!reportData?.users) return [];
        return reportData.users.map(u => ({
            'User': u.user_name,
            'Hours': parseFloat((u.total_seconds / 3600).toFixed(2)),
            'Cost': u.cost || 0,
            'Duration': `${u.total_time.hours}h ${u.total_time.minutes}m`,
        }));
    }, [reportData]);

    const handleUserClick = (userId: string | number) => {
        router.push(`/reports/team/${userId}?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    if (!reportData) return null;

    const totalHours = reportData.studio_total_time
        ? `${reportData.studio_total_time.hours}h ${reportData.studio_total_time.minutes}m`
        : '0h';
    const totalCost = reportData.studio_total_cost !== undefined
        ? `£${reportData.studio_total_cost.toLocaleString()}`
        : '—';

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <KpiCard label="Team Members" value={reportData.users?.length || 0} sub={reportData.studio_name} icon={Users} />
                <KpiCard label="Total Time Logged" value={totalHours} sub="This period" icon={Timer} />
                <KpiCard label="Total Cost" value={totalCost} sub="Staff cost this period" icon={DollarSign} />
            </div>

            {/* Controls row — sort + export only */}
            <div className="flex items-center justify-end gap-3">
                <Select value={chartMetric} onValueChange={(v: 'hours' | 'cost') => setChartMetric(v)}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Metric" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="time-desc">Most Time Logged</SelectItem>
                        <SelectItem value="time-asc">Least Time Logged</SelectItem>
                        <SelectItem value="cost-desc">Highest Cost</SelectItem>
                        <SelectItem value="cost-asc">Lowest Cost</SelectItem>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
                <ExportButton
                    data={exportData}
                    filename={`User_Report_${reportData?.studio_name?.replace(/\s+/g, '_') || 'Studio'}`}
                    sheetName="Users"
                />
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            User {chartMetric === 'hours' ? 'Time' : 'Cost'} Distribution
                        </CardTitle>
                        <CardDescription>Top users by {chartMetric === 'hours' ? 'hours logged' : 'cost'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="name"
                                        tickMargin={10}
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        height={80}
                                        className="text-xs font-medium"
                                    />
                                    <YAxis
                                        tickFormatter={v => chartMetric === 'hours' ? `${v}h` : `£${v}`}
                                        className="text-xs text-muted-foreground"
                                    />
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} content={<ChartTooltipContent hideLabel />} />
                                    <Bar
                                        dataKey={chartMetric}
                                        fill={chartMetric === 'hours' ? 'var(--color-hours)' : 'var(--color-cost)'}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* User Table */}
            <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <TableRow
                                        key={user.user_id}
                                        onClick={() => handleUserClick(user.user_id)}
                                        className="cursor-pointer hover:bg-stone-50"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {user.user_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-gray-900">{user.user_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-600 tabular-nums">
                                            {user.cost !== undefined && user.cost > 0 ? (
                                                <>
                                                    <ViewCurrencySymbol code={reportData.currency || ''} />
                                                    {user.cost.toLocaleString()}
                                                </>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right text-gray-600 tabular-nums">
                                            {user.total_time.hours}h {user.total_time.minutes}m
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-gray-500">
                                        No team members found.
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

export default UserReport;
