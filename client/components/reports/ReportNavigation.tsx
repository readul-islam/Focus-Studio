'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

interface ReportNavigationProps {
  activeTab: 'project' | 'user';
}

const ReportNavigation = ({ activeTab }: ReportNavigationProps) => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === 'project') {
      router.push('/reports');
    } else if (value === 'team') {
      router.push('/reports/team');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
           <p className="text-muted-foreground mt-1">Track project time and user productivity.</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="project">Project Report</TabsTrigger>
          <TabsTrigger value="team">Team Report</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ReportNavigation;
