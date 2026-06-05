import { useFormatter, useLocale, useTranslations } from 'next-intl';

export function useRelativeTime() {
  const t = useTranslations('common.time');
  const format = useFormatter();
  const locale = useLocale();

  return (dateString?: string) => {
    if (!dateString) return t('dash');
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return t('justNow');
    if (diffInHours < 24) return t('hoursAgo', { hours: diffInHours });
    if (diffInHours < 48) return t('yesterday');

    return format.dateTime(date, { day: 'numeric', month: 'short', year: 'numeric' });
  };
}

export function useShortDate() {
  const format = useFormatter();
  const t = useTranslations('common.time');

  return (dateString?: string | Date) => {
    if (!dateString) return t('dash');
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format.dateTime(date, { day: 'numeric', month: 'short', year: 'numeric' });
  };
}

export function useFinanceStatusOptions() {
  const t = useTranslations('finance.status');

  return [
    { label: t('all'), value: 'All' },
    { label: t('draft'), value: 'DFT' },
    { label: t('sent'), value: 'SNT' },
    { label: t('approved'), value: 'APR' },
    { label: t('paid'), value: 'PD' },
    { label: t('overdue'), value: 'OVD' },
  ];
}

export function useFileTypeLabel() {
  const t = useTranslations('documents.fileTypes');

  return (name?: string): string => {
    if (!name) return t('file');
    if (name.match(/\.(png|jpg|jpeg|gif|webp)$/i)) return t('image');
    if (name.match(/\.pdf$/i)) return t('pdf');
    if (name.match(/\.(xls|xlsx|csv)$/i)) return t('spreadsheet');
    if (name.match(/\.(doc|docx)$/i)) return t('document');
    return t('file');
  };
}
