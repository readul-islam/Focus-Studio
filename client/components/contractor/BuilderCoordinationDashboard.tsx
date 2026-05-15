'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  Zap,
  Hammer,
  HardHat,
} from 'lucide-react';
import type { BuilderCoordinationData, TradeType, TradeScheduleItem } from '@/lib/contractor/types';

interface BuilderCoordinationDashboardProps {
  data: BuilderCoordinationData;
}

const TRADE_ICONS: Record<TradeType, typeof Wrench> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Joinery: Hammer,
  General: HardHat,
};

const TRADE_COLORS: Record<TradeType, string> = {
  Plumbing: 'bg-slatex-500',
  Electrical: 'bg-ochre-500',
  Joinery: 'bg-sage-500',
  General: 'bg-greige-500',
};

const PHASE_LABELS: Record<TradeScheduleItem['phase'], string> = {
  rough_in: 'Rough-In',
  first_fix: 'First Fix',
  installation: 'Installation',
  finishing: 'Finishing',
};

const STATUS_CONFIG: Record<TradeScheduleItem['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-stone-100 text-neutral-600' },
  in_progress: { label: 'In Progress', className: 'bg-ochre-100 text-ochre-700' },
  complete: { label: 'Complete', className: 'bg-sage-100 text-sage-700' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function BuilderCoordinationDashboard({ data }: BuilderCoordinationDashboardProps) {
  const { trade_schedule, upcoming_deliveries, all_trades_summary } = data;

  // Calculate overall progress
  const completedPhases = trade_schedule.filter(s => s.status === 'complete').length;
  const totalPhases = trade_schedule.length;
  const overallProgress = Math.round((completedPhases / totalPhases) * 100);

  // Get current and upcoming work
  const currentWork = trade_schedule.filter(s => s.status === 'in_progress');
  const upcomingWork = trade_schedule.filter(s => s.status === 'pending').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-greige-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sage-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Progress</p>
              <p className="text-2xl font-semibold text-neutral-900">{overallProgress}%</p>
            </div>
          </div>
          <Progress value={overallProgress} className="mt-3 h-2" />
        </Card>

        <Card className="p-4 border-greige-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ochre-50 rounded-lg">
              <Clock className="w-5 h-5 text-ochre-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Active Now</p>
              <p className="text-2xl font-semibold text-neutral-900">{currentWork.length}</p>
              <p className="text-xs text-neutral-500">trades working</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-greige-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slatex-50 rounded-lg">
              <Truck className="w-5 h-5 text-slatex-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Deliveries</p>
              <p className="text-2xl font-semibold text-neutral-900">{upcoming_deliveries.length}</p>
              <p className="text-xs text-neutral-500">items pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-greige-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Package className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Items</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {all_trades_summary.reduce((sum, t) => sum + t.total_items, 0)}
              </p>
              <p className="text-xs text-neutral-500">across all trades</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trade Schedule Timeline */}
      <Card className="border-greige-500/30 overflow-hidden">
        <div className="p-4 border-b border-greige-500/30 bg-stone-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slatex-600" />
            <h2 className="font-semibold text-neutral-900">Trade Schedule</h2>
          </div>
        </div>
        <div className="divide-y divide-greige-500/20">
          {trade_schedule.map((schedule, index) => {
            const TradeIcon = TRADE_ICONS[schedule.trade];
            const status = STATUS_CONFIG[schedule.status];
            const tradeColor = TRADE_COLORS[schedule.trade];

            return (
              <div
                key={`${schedule.trade}-${schedule.phase}-${index}`}
                className={`p-4 flex items-center gap-4 ${
                  schedule.status === 'in_progress' ? 'bg-ochre-50/50' : ''
                }`}
              >
                {/* Trade indicator */}
                <div className={`w-1 h-12 rounded-full ${tradeColor}`} />

                {/* Trade icon */}
                <div className="p-2 bg-white border border-greige-500/30 rounded-lg">
                  <TradeIcon className="w-4 h-4 text-neutral-600" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{schedule.trade}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-sm text-neutral-600">{PHASE_LABELS[schedule.phase]}</span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">{schedule.contractor_name}</p>
                </div>

                {/* Dates */}
                <div className="text-right text-sm">
                  <p className="text-neutral-900 font-medium">
                    {formatDate(schedule.start_date)} - {formatDate(schedule.end_date)}
                  </p>
                </div>

                {/* Status */}
                <Badge className={`text-xs ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <Card className="border-greige-500/30 overflow-hidden">
          <div className="p-4 border-b border-greige-500/30 bg-stone-50">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-slatex-600" />
              <h2 className="font-semibold text-neutral-900">Upcoming Deliveries</h2>
            </div>
          </div>
          <div className="divide-y divide-greige-500/20 max-h-[320px] overflow-y-auto">
            {upcoming_deliveries.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">All items delivered</p>
              </div>
            ) : (
              upcoming_deliveries.map((item) => {
                const TradeIcon = TRADE_ICONS[item.trade];
                return (
                  <div key={item.id} className="p-3 flex items-center gap-3">
                    <div className="p-1.5 bg-stone-100 rounded">
                      <TradeIcon className="w-3 h-3 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-neutral-500">{item.room}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`text-xs ${
                          item.status === 'in_transit'
                            ? 'bg-ochre-100 text-ochre-700'
                            : 'bg-stone-100 text-neutral-600'
                        }`}
                      >
                        {item.status === 'in_transit' ? 'In Transit' : 'Ordered'}
                      </Badge>
                      {item.eta && (
                        <p className="text-xs text-neutral-500 mt-1">
                          ETA {formatDate(item.eta)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Trade Summary */}
        <Card className="border-greige-500/30 overflow-hidden">
          <div className="p-4 border-b border-greige-500/30 bg-stone-50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slatex-600" />
              <h2 className="font-semibold text-neutral-900">Items by Trade</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {all_trades_summary.map((summary) => {
              const TradeIcon = TRADE_ICONS[summary.trade];
              const deliveredPercent = summary.total_items > 0
                ? Math.round((summary.delivered / summary.total_items) * 100)
                : 0;

              return (
                <div key={summary.trade} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TradeIcon className="w-4 h-4 text-neutral-600" />
                      <span className="text-sm font-medium text-neutral-900">{summary.trade}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-sage-600">{summary.delivered} delivered</span>
                      <span className="text-neutral-400">|</span>
                      <span className="text-neutral-500">{summary.pending} pending</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={deliveredPercent} className="flex-1 h-2" />
                    <span className="text-xs text-neutral-500 w-10 text-right">
                      {deliveredPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Current Work Alert */}
      {currentWork.length > 0 && (
        <Card className="border-ochre-200 bg-ochre-50/50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ochre-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-ochre-900">Work in Progress</h3>
              <p className="text-sm text-ochre-700 mt-1">
                {currentWork.map(w => `${w.contractor_name} (${w.trade} - ${PHASE_LABELS[w.phase]})`).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}