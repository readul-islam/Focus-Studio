'use client';

import React, { useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { ProjectPhaseTimeResponse } from '@/types/reports';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { ViewCurrencySymbol } from '../ViewCurrencySymbol';
import { useCurrency } from '@/lib/getCurrencySymbol';
import { useRouter } from 'next/navigation';

interface ProjectPhasesProps {
  projectId: number;
}

const ProjectPhases = ({ projectId }: ProjectPhasesProps) => {
  const { data, isLoading, error } = useFetch(`/reports/project-phase-time/${projectId}/`);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">Failed to load project details.</div>;
  }

  if (!data) {
    return <div className="py-4 text-muted-foreground">No data found.</div>;
  }

  return (
    <>
      {data.phases && data.phases.length > 0 ? (
        data.phases.map((phase) => {
          const remainingHours =
            (phase?.hour_budget_seconds - phase?.total_seconds) / 3600;

          return (
            <tr onClick={() => { router.push(`/reports/phase/${phase.phase_id}`) }} key={phase.phase_name} className="bg-muted/5 cursor-pointer hover:bg-muted/50">
              <td className="px-4 py-2"></td>

              <td className="px-4 py-2 pl-">
                <span className="text-sm">
                  {phase.phase_name}
                </span>
              </td>

              <td className="px-4 py-2 text-right text-sm  tabular-nums">
                <ViewCurrencySymbol code={data?.currency || ''} />
                {phase?.total_budget ? phase?.total_budget?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}
              </td>

              <td className="px-4 py-2 text-right text-sm  tabular-nums">{Math.round(phase?.hour_budget)}h</td>

              <td className="px-4 py-2 text-right text-sm  tabular-nums">
                {Math.round(phase?.total_seconds / 3600)}h
              </td>

              <td
                className={`px-4 py-2 text-right text-sm tabular-nums ${remainingHours < 0 ? 'text-red-700' : 'text-[#748971]'
                  }`}
              >
                {Math.round(remainingHours)}h
              </td>


            </tr>
          )
        })
      ) : (
         <tr className="bg-muted/5">
        <td
          colSpan={7}
          className="px-4 py-2 pl-12 text-sm text-muted-foreground italic"
        >
          No team breakdown available
        </td>
      </tr>
      )}
    </>
  );

};

export default ProjectPhases;
