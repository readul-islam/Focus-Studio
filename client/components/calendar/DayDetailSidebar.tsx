import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface DayDetailSidebarProps {
  selectedDate: Date;
  phases: any[];
  deliveries: any[];
  tasks: any[];
  getPhaseLightColor: (id: number) => string;
  getTaskStatusConfig: (status: string) => any;
}

export function DayDetailSidebar({
  selectedDate,
  phases,
  deliveries,
  tasks,
  getPhaseLightColor,
  getTaskStatusConfig,
}: DayDetailSidebarProps) {
  const totalItems = phases.length + deliveries.length + tasks.length;

  return (
    <div className="w-80 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-lg">{format(selectedDate, 'EEEE, MMM do')}</h2>
        <div className="flex gap-2 text-sm text-gray-500 mt-1">
          {phases.length > 0 && <span>{phases.length} Phases</span>}
          {deliveries.length > 0 && (
            <>
              {phases.length > 0 && '• '}
              <span>{deliveries.length} Deliveries</span>
            </>
          )}
          {tasks.length > 0 && (
            <>
              {(phases.length > 0 || deliveries.length > 0) && '• '}
              <span>{tasks.length} Tasks</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Phases Section */}
        {phases.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Phases</h3>
            {phases.map((phase: any) => (
              <div key={phase.id} className={`p-3 rounded-lg border ${getPhaseLightColor(phase.colorIndex)} border-opacity-20`}>
                <h3 className="font-medium text-sm">{phase.project_name}</h3>
                <p className="text-xs opacity-80 mt-1 line-clamp-2">{phase.name}</p>
                <div className="mt-2 flex items-center justify-between text-xs font-medium opacity-70">
                  <span>{phase.progress}% Done</span>
                  <span>{format(phase.endDate, 'MMM d')}</span>
                </div>
                <div className="w-full bg-white/50 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-current opacity-50" style={{ width: `${phase.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Dates Section */}
        {deliveries.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliveries</h3>
            {deliveries.map((delivery: any) => (
              <div key={delivery.id} className="p-3 rounded-lg border border-purple-100 bg-purple-50">
                <h3 className="font-medium text-sm text-purple-900">{delivery.project_name}</h3>
                <p className="text-xs text-purple-700 mt-1">{delivery.product_name}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-purple-600">
                  <Clock className="w-3 h-3" />
                  <span>ETA: {format(delivery.deliveryDate, 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Tasks</h3>
            {tasks.map((task: any) => {
              const statusConfig = getTaskStatusConfig(task.status);
              return (
                <div key={task.id} className={`p-3 rounded-lg border ${statusConfig.className} border-opacity-20`}>
                  <h3 className="font-medium text-sm">{task.project_name}</h3>
                  <p className="text-xs opacity-80 mt-1 line-clamp-2">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs font-medium opacity-70">
                    <span>Status: {statusConfig.label}</span>
                    <span>{format(task.endDate, 'MMM d')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="text-center py-10 bg-stone-50 rounded-lg border border-dashed border-gray-200">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No events for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
