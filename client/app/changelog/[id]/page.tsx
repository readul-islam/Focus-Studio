'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, Sparkles, Bug, Zap, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useFetch from '@/hooks/useFetch';
import { cn } from '@/lib/utils';

type ChangeType = 'feature' | 'fix' | 'improvement' | 'breaking' | 'other';

interface ChangelogEntry {
  id: number;
  title: string;
  description: string;
  change_type: ChangeType;
  change_type_display: string;
  date: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

function ChangeTypeBadge({ type }: { type: ChangeType }) {
  const t = useTranslations('changelogPage.types');
  const config = {
    feature: {
      icon: Sparkles,
      label: t('feature'),
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    fix: {
      icon: Bug,
      label: t('fix'),
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    improvement: {
      icon: Zap,
      label: t('improvement'),
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
    },
    breaking: {
      icon: AlertTriangle,
      label: t('breaking'),
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    other: {
      icon: MoreHorizontal,
      label: t('other'),
      color: 'text-gray-700',
      bgColor: 'bg-stone-50',
      borderColor: 'border-gray-200',
    },
  }[type] ?? {
    icon: MoreHorizontal,
    label: t('other'),
    color: 'text-gray-700',
    bgColor: 'bg-stone-50',
    borderColor: 'border-gray-200',
  };
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.bgColor,
        config.color,
        config.borderColor
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function ChangelogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('changelogDetailPage');

  const { data, isLoading } = useFetch<ChangelogEntry>(`changelog/${id}/`);

  return (
    <div className="space-y-8">
      <Link
        href="/changelog"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {t('backToChangelog')}
      </Link>

      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-500">{t('loading')}</p>
        </div>
      )}

      {!isLoading && data && (
        <article className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <time className="text-sm text-gray-500">{format(parseISO(data.date), 'MMMM d, yyyy')}</time>
            <ChangeTypeBadge type={data.change_type} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">{data.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100">
            <span>{t('byAuthor', { name: data.created_by_name })}</span>
            {data.updated_at !== data.created_at && (
              <span>{t('updatedOn', { date: format(parseISO(data.updated_at), 'MMM d, yyyy') })}</span>
            )}
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{data.description}</p>
          </div>
        </article>
      )}

      {!isLoading && !data && (
        <div className="py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('entryNotFound')}</h2>
          <p className="text-sm text-gray-500 mb-4">{t('entryNotFoundDesc')}</p>
          <Link
            href="/changelog"
            className="text-sm font-medium text-gray-900 hover:text-gray-600 underline underline-offset-4"
          >
            {t('viewAllUpdates')}
          </Link>
        </div>
      )}
    </div>
  );
}
