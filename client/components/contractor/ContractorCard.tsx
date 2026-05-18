'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Package,
  FileText,
  Plus,
  Check,
  Eye,
  Clock,
  Wrench,
  Zap,
  Hammer,
  HardHat,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import type { ProjectContractor, TradeType, ContractorShare } from '@/lib/contractor/types';

interface ContractorCardProps {
  contractor: ProjectContractor;
  projectId: string;
  onCopyLink: () => void;
  onOpenPortal: () => void;
  onRemoveShare?: (shareId: string) => void;
  onMessage?: () => void;
  onShareFiles?: () => void;
  onProfile?: () => void;
}

const TRADE_ICONS: Record<TradeType, typeof Wrench> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Joinery: Hammer,
  General: HardHat,
};

const TRADE_COLORS: Record<TradeType, string> = {
  Plumbing: 'bg-slatex-100 text-slatex-700',
  Electrical: 'bg-ochre-100 text-ochre-700',
  Joinery: 'bg-sage-100 text-sage-700',
  General: 'bg-greige-100 text-greige-700',
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Never accessed';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Last access: Today';
  if (diffDays === 1) return 'Last access: Yesterday';
  if (diffDays < 7) return `Last access: ${diffDays} days ago`;
  if (diffDays < 30) return `Last access: ${Math.floor(diffDays / 7)} weeks ago`;
  return `Last access: ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
}

// Calculate insurance status based on expiry date
function getInsuranceStatus(insurance_expiry?: string): {
  status: 'valid' | 'expiring' | 'expired' | 'not_uploaded';
  label: string;
  color: string;
  dotColor: string;
} {
  if (!insurance_expiry) {
    return {
      status: 'not_uploaded',
      label: 'Not uploaded',
      color: 'text-neutral-600',
      dotColor: 'bg-stone-400',
    };
  }

  const expiryDate = new Date(insurance_expiry);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: 'Expired',
      color: 'text-red-700',
      dotColor: 'bg-red-500',
    };
  }

  if (diffDays < 30) {
    return {
      status: 'expiring',
      label: `Expires in ${diffDays} days`,
      color: 'text-amber-700',
      dotColor: 'bg-amber-500',
    };
  }

  return {
    status: 'valid',
    label: `Valid until ${expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    color: 'text-green-700',
    dotColor: 'bg-green-500',
  };
}

function ShareRow({ share, type, onRemove }: { share: ContractorShare; type: 'item' | 'drawing'; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-stone-50 rounded-md group">
      <div className="w-6 h-6 rounded bg-white flex items-center justify-center flex-shrink-0">
        {type === 'item' ? (
          <Package className="w-3.5 h-3.5 text-neutral-400" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-neutral-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800 truncate">{share.item_name}</p>
        <p className="text-xs text-neutral-500">
          Shared {formatRelativeTime(share.shared_at)}
        </p>
      </div>
      {share.viewed_at ? (
        <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-sage-300/40 text-olive-700 border border-olive-700/20 gap-1">
          <Eye className="w-3 h-3" />
          Viewed
        </span>
      ) : (
        <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-stone-100 text-neutral-600 border border-neutral-200 gap-1">
          <Clock className="w-3 h-3" />
          Not viewed
        </span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-stone-200 rounded transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
        </button>
      )}
    </div>
  );
}

export function ContractorCard({
  contractor,
  projectId,
  onCopyLink,
  onOpenPortal,
  onRemoveShare,
  onMessage,
  onShareFiles,
  onProfile,
  projectEditPermission
  
}: ContractorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const TradeIcon = TRADE_ICONS[contractor.trade];
  const totalShared = contractor.shared_items.length + contractor.shared_drawings.length;
  const confirmedDrawings = contractor.shared_drawings.filter(s =>
    contractor.activities.some(a =>
      a.type === 'drawing_confirmed' && a.related_id === s.item_id
    )
  ).length;

  const handleCopyLink = () => {
    onCopyLink();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Card className="border-neutral-200 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex xl:items-center items-start flex-col xl:flex-row justify-between   gap-3">
          
          <div className="flex items-start md:items-center gap-3">
          {/* Expand Icon */}
          <div className="text-neutral-400">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>

          {/* Trade Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${TRADE_COLORS[contractor.trade]}`}>
            <TradeIcon className="w-5 h-5" />
          </div>

          {/* Contractor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-neutral-900">{contractor.name}</h3>
              {(contractor.trade_label || contractor.trade) && (
                <Badge variant="outline" className="text-xs">
                  {contractor.trade_label || (contractor.trade === 'General' ? 'Builder' : contractor.trade)}
                </Badge>
              )}
              {contractor.access_code && (
                <Badge variant="secondary" className="text-xs font-mono">
                  {contractor.access_code}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500 flex-wrap">
              {/* Insurance Status Badge */}
              {(() => {
                const insurance = getInsuranceStatus((contractor as any).insurance_expiry);
                return (
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${insurance.dotColor}`} />
                    <span className={insurance.color}>
                      Insurance: {insurance.label}
                    </span>
                  </div>
                );
              })()}
              <span>·</span>
              <span>{contractor.shared_items.length} items</span>
              <span>·</span>
              <span>{contractor.shared_drawings.length} drawings</span>
              {contractor.last_accessed && (
                <>
                  <span>·</span>
                  <span>{formatRelativeTime(contractor.last_accessed)}</span>
                </>
              )}
              {!contractor.last_accessed && (
                <>
                  <span>·</span>
                  <span className="text-neutral-400">Never accessed</span>
                </>
              )}
            </div>
          </div>
          
          </div>

          {/* Quick Actions */}
         {projectEditPermission && <div className="flex xl:w-auto w-full xl:justify-end justify-center items-center gap-2" onClick={e => e.stopPropagation()}>
            <Button size="sm"
              className="h-8" variant={'outline'}>
                   <Link className='flex items-center' href={`/projects/${projectId}/procurement?shareWith=${contractor.id}&contractorName=${encodeURIComponent(contractor.name)}`}>
                    <Package className="w-4 h-4 mr-2" />
                    Share Items
                  </Link>
            </Button>
            <Button size="sm"
              className="h-8" variant={'outline'}>
                      <Link className='flex items-center' href={`/projects/${projectId}/docs?shareWith=${contractor.id}&contractorName=${encodeURIComponent(contractor.name)}&view=list`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Share Drawings
                  </Link>
            </Button>
            {onProfile && (
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={onProfile}
              >
                Profile
              </Button>
            )}
            {/* <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleCopyLink}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-sage-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Link
                </>
              )}
            </Button> */}
            {/* <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={onOpenPortal}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              View
            </Button> */}
            {/* {onMessage && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={onMessage}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Message
              </Button>
            )} */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${projectId}/procurement?shareWith=${contractor.id}&contractorName=${encodeURIComponent(contractor.name)}`}>
                    <Package className="w-4 h-4 mr-2" />
                    Share Items
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${projectId}/docs?shareWith=${contractor.id}&contractorName=${encodeURIComponent(contractor.name)}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Share Drawings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 p-4 xl:ml-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Shared Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slatex-600" />
                  Shared Items ({contractor.shared_items.length})
                </h4>
              {projectEditPermission &&  <Link
                  href={`/projects/${projectId}/procurement?shareWith=${contractor.id}&contractorName=${encodeURIComponent(contractor.name)}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-white border-greige-500/30"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add from Procurement
                  </Button>
                </Link>}
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {contractor.shared_items.length === 0 ? (
                  <p className="text-sm text-center text-neutral-500 py-2">No items shared yet</p>
                ) : (
                  contractor.shared_items.map(share => (
                    <ShareRow
                      key={share.id}
                      share={share}
                      type="item"
                      onRemove={onRemoveShare ? () => onRemoveShare(share.id) : undefined}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Shared Drawings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sage-600" />
                  Shared Drawings ({contractor.shared_drawings.length})
                  {confirmedDrawings > 0 && (
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-sage-300/40 text-olive-700 border border-olive-700/20">
                      {confirmedDrawings} confirmed
                    </span>
                  )}
                </h4>
             {projectEditPermission &&   <Link
                  href={`/projects/${projectId}/docs?shareWith=${contractor.id}&contractorName=${encodeURIComponent(contractor.name)}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-white border-greige-500/30"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add from Files
                  </Button>
                </Link>}
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {contractor.shared_drawings.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-2">No drawings shared yet</p>
                ) : (
                  contractor.shared_drawings.map(share => (
                    <ShareRow
                      key={share.id}
                      share={share}
                      type="drawing"
                      onRemove={onRemoveShare ? () => onRemoveShare(share.id) : undefined}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity */}
          {contractor.activities.length > 0 && (
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <h4 className="text-sm font-medium text-neutral-800 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {contractor.activities.slice(0, 3).map(activity => (
                  <div key={activity.id} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    <span className="text-neutral-700">{activity.description || activity.title}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-500">{formatRelativeTime(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}