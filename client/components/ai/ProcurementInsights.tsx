'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  PackageX,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
  Sparkles,
  X
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Types for procurement item from existing API
interface ProcurementItem {
  id: string;
  status?: string; // QT=Quoting, OS=Out of Stock, etc.
  client_approval?: string; // APR, REJ, RVW
  created_at?: string;
  updated_at?: string;
  product?: {
    id?: string;
    name?: string;
  };
  supplier?: {
    id?: string;
    company_name?: string;
  };
  room?: {
    id?: string;
    name?: string;
  };
  client_comment?: string;
}

interface DerivedInsight {
  id: string;
  type: 'stuck_quote' | 'out_of_stock' | 'client_rejection';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  procurement_id: string;
  action_required: boolean;
  action_label?: string;
  action_href?: string;
}

interface ProcurementInsightsProps {
  projectId?: string;
  procurementItems?: ProcurementItem[];
  className?: string;
  onDismiss?: () => void;
}

// Helper to calculate days since a date
function daysSince(dateString?: string): number {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function ProcurementInsights({
  projectId,
  procurementItems = [],
  className,
  onDismiss
}: ProcurementInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Derive insights from real procurement data
  const insights = useMemo(() => {
    if (!procurementItems || procurementItems.length === 0) return [];

    const derived: DerivedInsight[] = [];

    procurementItems.forEach((item) => {
      // Stuck quotes: status='QT' (Quoting) and older than 3 days
      if (item.status === 'QT') {
        const days = daysSince(item.created_at || item.updated_at);
        if (days >= 3) {
          const severity = days >= 7 ? 'urgent' : 'warning';
          derived.push({
            id: `stuck-${item.id}`,
            type: 'stuck_quote',
            severity,
            title: `Quote pending ${days} days`,
            description: `${item.product?.name || 'Item'} from ${item.supplier?.company_name || 'supplier'} - no response yet`,
            procurement_id: item.id,
            action_required: true,
            action_label: 'Send Follow-up',
          });
        }
      }

      // Out of stock: status='OS'
      if (item.status === 'OS') {
        derived.push({
          id: `oos-${item.id}`,
          type: 'out_of_stock',
          severity: 'urgent',
          title: 'Out of stock',
          description: `${item.product?.name || 'Item'} is no longer available from ${item.supplier?.company_name || 'supplier'}`,
          procurement_id: item.id,
          action_required: true,
          action_label: 'Find Alternative',
        });
      }

      // Client rejections: client_approval='REJ'
      if (item.client_approval === 'REJ') {
        derived.push({
          id: `rej-${item.id}`,
          type: 'client_rejection',
          severity: 'warning',
          title: 'Client rejected',
          description: `${item.product?.name || 'Item'}${item.client_comment ? ` - "${item.client_comment}"` : ' - needs replacement'}`,
          procurement_id: item.id,
          action_required: true,
          action_label: 'Find Alternative',
        });
      }
    });

    // Sort by severity (urgent first)
    const severityOrder = { urgent: 0, warning: 1, info: 2 };
    derived.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return derived;
  }, [procurementItems]);

  // Don't render if dismissed or no insights
  if (isDismissed || insights.length === 0) {
    return null;
  }

  const urgentCount = insights.filter(i => i.severity === 'urgent').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;

  const getIcon = (type: DerivedInsight['type']) => {
    switch (type) {
      case 'stuck_quote':
        return Clock;
      case 'out_of_stock':
        return PackageX;
      case 'client_rejection':
        return MessageSquare;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityStyles = (severity: DerivedInsight['severity']) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-white border-neutral-200 text-neutral-800';
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={cn(
      'bg-white border border-sage-200/50 rounded-xl shadow-sm',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4  ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-neutral-900 text-sm">AI Insights</h3>
            <p className="text-xs text-neutral-500">
              {insights.length} item{insights.length !== 1 ? 's' : ''} need{insights.length === 1 ? 's' : ''} attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity badges */}
          {urgentCount > 0 && (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
              {urgentCount} urgent
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
              {warningCount} warning
            </Badge>
          )}

          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {/* Dismiss */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Insights List */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {insights.map((insight) => {
            const Icon = getIcon(insight.type);

            return (
              <div
                key={insight.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  getSeverityStyles(insight.severity)
                )}
              >
                <div className="p-1.5 bg-white rounded-md shadow-sm flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs mt-0.5 opacity-80">{insight.description}</p>
                </div>

                {insight.action_required && insight.action_label && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex-shrink-0 bg-white"
                  >
                    {insight.action_label}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Actions */}
      {isExpanded && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-stone-50/50 rounded-b-xl">
          <Link
            href="/ai/activity"
            className="text-xs text-neutral-600 hover:text-primary transition-colors"
          >
            View all AI activity
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              View All
            </Button>
            <Button variant="default" size="sm" className="h-7 text-xs">
              <Send className="w-3 h-3 mr-1" />
              Send All Follow-ups
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcurementInsights;