'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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

const STATUS_CLASSNAMES: Record<TradeScheduleItem['status'], string> = {
  pending: 'bg-stone-100 text-neutral-600',
  in_progress: 'bg-ochre-100 text-ochre-700',
  complete: 'bg-sage-100 text-sage-700',
};

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

export function BuilderCoordinationDashboard({ data }: BuilderCoordinationDashboardProps) {
  const t = useTranslations('builderCoordinationDashboard');
  const locale = useLocale();
  const { trade_schedule, upcoming_deliveries, all_trades_summary } = data;

  const phaseLabels = useMemo(
    () => ({
      rough_in: t('phases.rough_in'),
      first_fix: t('phases.first_fix'),
      installation: t('phases.installation'),
      finishing: t('phases.finishing'),
    }),
    [t]
  );

  const statusLabels = useMemo(
    () => ({
      pending: t('statuses.pending'),
      in_progress: t('statuses.in_progress'),
      complete: t('statuses.complete'),
    }),
    [t]
  );

  const completedPhases = trade_schedule.filter(s => s.status === 'complete').length;
  const totalPhases = trade_schedule.length;
  const overallProgress = Math.round((completedPhases / totalPhases) * 100);

  const currentWork = trade_schedule.filter(s => s.status === 'in_progress');
  const upcomingWork = trade_schedule.filter(s => s.status === 'pending').slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-greige-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sage-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">{t('stats.progress')}</p>
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
              <p className="text-xs text-neutral-500 uppercase tracking-wide">{t('stats.activeNow')}</p>
              <p className="text-2xl font-semibold text-neutral-900">{currentWork.length}</p>
              <p className="text-xs text-neutral-500">{t('stats.tradesWorking')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-greige-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slatex-50 rounded-lg">
              <Truck className="w-5 h-5 text-slatex-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">{t('stats.deliveries')}</p>
              <p className="text-2xl font-semibold text-neutral-900">{upcoming_deliveries.length}</p>
              <p className="text-xs text-neutral-500">{t('stats.itemsPending')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-greige-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Package className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">{t('stats.totalItems')}</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {all_trades_summary.reduce((sum, trade) => sum + trade.total_items, 0)}
              </p>
              <p className="text-xs text-neutral-500">{t('stats.acrossAllTrades')}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-greige-500/30 overflow-hidden">
        <div className="p-4 border-b border-greige-500/30 bg-stone-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slatex-600" />
            <h2 className="font-semibold text-neutral-900">{t('tradeSchedule')}</h2>
          </div>
        </div>
        <div className="divide-y divide-greige-500/20">
          {trade_schedule.map((schedule, index) => {
            const TradeIcon = TRADE_ICONS[schedule.trade];
            const tradeColor = TRADE_COLORS[schedule.trade];

            return (
              <div
                key={`${schedule.trade}-${schedule.phase}-${index}`}
                className={`p-4 flex items-center gap-4 ${
                  schedule.status === 'in_progress' ? 'bg-ochre-50/50' : ''
                }`}
              >
                <div className={`w-1 h-12 rounded-full ${tradeColor}`} />

                <div className="p-2 bg-white border border-greige-500/30 rounded-lg">
                  <TradeIcon className="w-4 h-4 text-neutral-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{schedule.trade}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-sm text-neutral-600">{phaseLabels[schedule.phase]}</span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">{schedule.contractor_name}</p>
                </div>

                <div className="text-right text-sm">
                  <p className="text-neutral-900 font-medium">
                    {formatDate(schedule.start_date, locale)} - {formatDate(schedule.end_date, locale)}
                  </p>
                </div>

                <Badge className={`text-xs ${STATUS_CLASSNAMES[schedule.status]}`}>
                  {statusLabels[schedule.status]}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-greige-500/30 overflow-hidden">
          <div className="p-4 border-b border-greige-500/30 bg-stone-50">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-slatex-600" />
              <h2 className="font-semibold text-neutral-900">{t('upcomingDeliveries')}</h2>
            </div>
          </div>
          <div className="divide-y divide-greige-500/20 max-h-[320px] overflow-y-auto">
            {upcoming_deliveries.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">{t('allItemsDelivered')}</p>
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
                        {item.status === 'in_transit'
                          ? t('deliveryStatuses.in_transit')
                          : t('deliveryStatuses.ordered')}
                      </Badge>
                      {item.eta && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {t('eta', { date: formatDate(item.eta, locale) })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="border-greige-500/30 overflow-hidden">
          <div className="p-4 border-b border-greige-500/30 bg-stone-50">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slatex-600" />
              <h2 className="font-semibold text-neutral-900">{t('itemsByTrade')}</h2>
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
                      <span className="text-sage-600">
                        {t('deliveredCount', { count: summary.delivered })}
                      </span>
                      <span className="text-neutral-400">|</span>
                      <span className="text-neutral-500">
                        {t('pendingCount', { count: summary.pending })}
                      </span>
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

      {currentWork.length > 0 && (
        <Card className="border-ochre-200 bg-ochre-50/50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ochre-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-ochre-900">{t('workInProgress')}</h3>
              <p className="text-sm text-ochre-700 mt-1">
                {currentWork
                  .map(w =>
                    t('workInProgressItem', {
                      contractor: w.contractor_name,
                      trade: w.trade,
                      phase: phaseLabels[w.phase],
                    })
                  )
                  .join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
