import { enGB, ja } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';

const INVOICE_STATUS_VALUES = ['All', 'DFT', 'SNT', 'APR', 'PD', 'OVD', 'NE', 'RCV'] as const;

const INVOICE_STATUS_KEY: Record<string, string> = {
  All: 'all',
  DFT: 'draft',
  SNT: 'sent',
  APR: 'approved',
  PD: 'paid',
  OVD: 'overdue',
  NE: 'draft',
  RCV: 'received',
};

export function useDateLocale() {
  const locale = useLocale();
  return locale === 'ja-JP' ? 'ja-JP' : 'en-GB';
}

export function useDateFnsLocale() {
  const locale = useLocale();
  return locale === 'ja-JP' ? ja : enGB;
}

export function useFileTypeLabel() {
  const t = useTranslations('fileTypes');

  return (name?: string): string => {
    if (!name) return t('file');
    if (name.match(/\.(png|jpg|jpeg|gif|webp)$/i)) return t('image');
    if (name.match(/\.pdf$/i)) return t('pdf');
    if (name.match(/\.(xls|xlsx|csv)$/i)) return t('spreadsheet');
    if (name.match(/\.(doc|docx)$/i)) return t('document');
    return t('file');
  };
}

export function useRelativeDateFormatter() {
  const dateLocale = useDateLocale();
  const dateFnsLocale = useDateFnsLocale();
  const t = useTranslations('common');

  return {
    formatRelative(dateString?: string) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffInHours < 1) return t('justNow');
      if (diffInHours < 24) return t('hoursAgo', { hours: diffInHours });
      if (diffInHours < 48) return t('yesterday');
      return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' });
    },
    formatDistance(date: Date) {
      return formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocale });
    },
    formatShort(input: string | Date) {
      const date = typeof input === 'string' ? new Date(input) : input;
      return date?.toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
  };
}

export function useInvoiceStatusLabel() {
  const t = useTranslations('invoiceStatus');

  return (value: string) => {
    const key = INVOICE_STATUS_KEY[value];
    return key ? t(key as 'all') : value;
  };
}

export function useInvoiceStatusOptions(includeAll = false) {
  const label = useInvoiceStatusLabel();

  const options = INVOICE_STATUS_VALUES.filter((v) => v !== 'All' && v !== 'NE' && v !== 'RCV').map(
    (value) => ({
      value,
      label: label(value),
    }),
  );

  if (includeAll) {
    return [{ value: 'All', label: label('All') }, ...options];
  }

  return options;
}

export const UNCATEGORIZED_ROOM_KEY = '__uncategorized__';

const UNIT_TYPE_KEYS = new Set(['EA', 'M', 'M2', 'ST']);

export function useUnitTypeLabel() {
  const t = useTranslations('procurement.units');

  return (unit: string) => {
    const key = unit === 'M^^2' || unit === 'M²' ? 'M2' : unit;
    return UNIT_TYPE_KEYS.has(key) ? t(key as 'EA') : unit;
  };
}

export function useRoomDisplayName() {
  const tc = useTranslations('common');
  return (roomName: string) =>
    roomName === UNCATEGORIZED_ROOM_KEY || roomName === 'Uncategorized' ? tc('uncategorized') : roomName;
}

export function usePageTitle() {
  const tc = useTranslations('common');

  return (pageTitle: string) => tc('pageTitleSuffix', { page: pageTitle, brand: tc('brand') });
}

export function useNavMenuItems() {
  const t = useTranslations('nav');

  return [
    { labelKey: 'dashboard' as const, label: t('dashboard') },
    { labelKey: 'messages' as const, label: t('messages') },
    { labelKey: 'procurement' as const, label: t('procurement') },
    { labelKey: 'finances' as const, label: t('finances') },
    { labelKey: 'documents' as const, label: t('documents') },
  ];
}
