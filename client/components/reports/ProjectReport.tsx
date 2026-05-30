'use client';

import React, { useState, useMemo } from 'react';
import useFetch from '@/hooks/useFetch';
import { TotalProjectTimeResponse } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProjectPhases from './ProjectPhases';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Timer } from 'lucide-react';
import { ViewCurrencySymbol } from '../ViewCurrencySymbol';
import { useCurrency } from '@/lib/getCurrencySymbol';
import ExportButton from '@/components/ui/ExportButton';
import { useTranslations } from 'next-intl';

const ProjectReport = () => {
  const t = useTranslations('reportsProjectPage');
  const { data, isLoading, error } = useFetch('/reports/total-project-time/');
  const reportData = data as TotalProjectTimeResponse;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('time-desc');
  const [showActiveOnly, setShowActiveOnly] = useState('true');
  const [chartMetric, setChartMetric] = useState<'hours' | 'cost'>('hours');

  const filteredProjects = useMemo(() => {
     if (!reportData?.projects) return [];
     let projects = reportData.projects.filter(p => 
        p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
     );

     if (showActiveOnly === 'true') {
         projects = projects.filter(p => p.total_seconds > 0);
     }

     return projects.sort((a, b) => {
         if (sortBy === 'time-desc') return b.total_seconds - a.total_seconds;
         if (sortBy === 'time-asc') return a.total_seconds - b.total_seconds;
         if (sortBy === 'cost-desc') return (b.cost || 0) - (a.cost || 0);
         if (sortBy === 'cost-asc') return (a.cost || 0) - (b.cost || 0);
         if (sortBy === 'name-asc') return a.project_name.localeCompare(b.project_name);
         if (sortBy === 'name-desc') return b.project_name.localeCompare(a.project_name);
         return 0;
     });
  }, [reportData, searchQuery, sortBy, showActiveOnly]);

  const chartData = useMemo(() => {
      return filteredProjects
         .slice(0, 15) // Top 15 projects
         .map(p => ({
            name: p.project_name,
            hours: parseFloat((p.total_seconds / 3600).toFixed(2)),
            cost: p.cost || 0,
            formatted: p.total_time.formatted,
         }));
  }, [filteredProjects]);

  const chartConfig = {
    hours: {
        label: "Hours",
        color: "hsl(var(--primary))",
    },
    cost: {
        label: "Cost (£)",
        color: "hsl(var(--chart-2))", 
    }
  };

   const exportData = useMemo(() => {
        if (!reportData?.projects) return [];
        return reportData.projects.map(p => ({
            'Project ID': p.project_id,
            'Project Name': p.project_name,
            'Total Time': p.total_time.formatted,
            'Total Hours': parseFloat((p.total_seconds / 3600).toFixed(2)),
            'Cost': p.cost || 0,
            'Currency': reportData.currency || 'GBP'
        }));
    }, [reportData]);

  if (isLoading) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    );
  }

  if (error) return <div className="text-red-500 p-4">{t('loadFailed')}</div>;
  if (!reportData) return <div className="p-4">{t('noData')}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
 

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
           <div  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex  items-center gap-3">
              <Timer className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <div className="flex-1  min-w-0">
                <p className="text-sm font-medium text-gray-600">{t('studioTotalTime')}</p>
                <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">{reportData.studio_total_time.hours}h {reportData.studio_total_time.minutes}m {reportData.studio_total_time.seconds}s</p>
                <p className="text-xs text-gray-500">{reportData.studio_name}</p>
              </div>
            </div>
          </div>
          {reportData.studio_total_cost !== undefined && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="text-gray-500  flex items-center justify-center text-sm">
                        <ViewCurrencySymbol code={reportData.currency || ''}/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600">{t('studioTotalCost')}</p>
                        <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">
                           <ViewCurrencySymbol code={reportData.currency || ''}/>
                            {reportData.studio_total_cost.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{t('estimatedCost')}</p>
                    </div>
                </div>
            </div>
          )}
        </div>
        
        
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
           <div className="relative w-full max-w-[400px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t('searchProjects')}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
           </div>
           
           <div className="flex flex-wrap gap-4 items-center">
                <Select value={chartMetric} onValueChange={(v: 'hours' | 'cost') => setChartMetric(v)}>
                     <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('metric')} />
                     </SelectTrigger>
                     <SelectContent>
                          <SelectItem value="hours">{t('hours')}</SelectItem>
                          <SelectItem value="cost">{t('cost')}</SelectItem>
                     </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                     <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('sortBy')} />
                     </SelectTrigger>
                     <SelectContent>
                          <SelectItem value="time-desc">{t('mostTimeLogged')}</SelectItem>
                          <SelectItem value="time-asc">{t('leastTimeLogged')}</SelectItem>
                          <SelectItem value="cost-desc">{t('highestCost')}</SelectItem>
                          <SelectItem value="cost-asc">{t('lowestCost')}</SelectItem>
                          <SelectItem value="name-asc">{t('nameAsc')}</SelectItem>
                          <SelectItem value="name-desc">{t('nameDesc')}</SelectItem>
                     </SelectContent>
                </Select>
             
                <Select value={showActiveOnly} onValueChange={setShowActiveOnly}>
                     <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('filterProjects')} />
                     </SelectTrigger>
                     <SelectContent>
                          <SelectItem value="true">{t('activeProjectsOnly')}</SelectItem>
                          <SelectItem value="false">{t('allProjects')}</SelectItem>
                     </SelectContent>
                </Select>

                <ExportButton 
                     data={exportData} 
                     filename={`Project_Report_${reportData.studio_name.replace(/\s+/g, '_')}`} 
                     sheetName="Projects"
                />
           </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>{chartMetric === 'hours' ? t('chartTimeDistribution') : t('chartCostDistribution')}</CardTitle>
                    <CardDescription>{chartMetric === 'hours' ? t('topProjectsByHours') : t('topProjectsByCost')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                    dataKey="name" 
                                    // tickLine={false} 
                                    tick={{ fontSize: 12 }}
                                    tickMargin={10} 
                                    axisLine={false} 
                                    minTickGap={30}
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                    className="text-xs font-medium"
                                />
                                <YAxis 
                                    // tickLine={false} 
                                    tick={{ fontSize: 12 }}
                                    // axisLine={false} 
                                    tickFormatter={(value) => chartMetric === 'hours' ? `${value}h` : `£${value}`} 
                                    className="text-xs text-muted-foreground"
                                />
                                <ChartTooltip 
                                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                                    content={<ChartTooltipContent hideLabel />} 
                                />
                                <Bar 
                                    dataKey={chartMetric} 
                                    fill={chartMetric === 'hours' ? "var(--color-hours)" : "var(--color-cost)"} 
                                    radius={[4, 4, 0, 0]} 
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Project List */}
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>{t('projectDetails')}</CardTitle>
                <CardDescription>
                    {t('clickProjectDetails')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                            <AccordionItem key={project.project_id} value={project.project_id.toString()} className="border-b border-muted last:border-0">
                                <AccordionTrigger className="hover:no-underline py-4 hover:bg-muted/30 px-2 rounded-md transition-all">
                                    <div className="flex justify-between items-center w-full pr-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{project.project_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         {project.cost !== undefined && (
                                              <span className=" text-sm text-muted-foreground mr-2">
                                                  <ViewCurrencySymbol code={reportData.currency || ''}/>{project.cost.toLocaleString()}
                                              </span>
                                         )}
                                         <span className="  text-sm bg-muted px-2 py-1 rounded text-foreground">{project.total_time.hours}h {project.total_time.minutes}m {project.total_time.seconds}s</span>
                                    </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-2 pb-4">
                                    <ProjectPhases projectId={project.project_id} />
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                             {t('noProjectsFoundFilters')}
                        </div>
                    )}
                </Accordion>
            </CardContent>
        </Card>
    </div>
  );
};

export default ProjectReport;
