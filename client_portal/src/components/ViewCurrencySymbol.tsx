import { useCurrency } from '@/hooks/getCurrencySymbol';
import { useTranslations } from 'next-intl';

export const ViewCurrencySymbol = ({ code }: { code: string }) => {
  const { currency, isLoading } = useCurrency(code);
  const tc = useTranslations('common');

  return <span>{isLoading ? tc('loadingEllipsis') : currency.symbol}</span>;
};
