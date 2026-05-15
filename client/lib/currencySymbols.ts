// Static currency symbol map - no API calls needed
// This covers all ISO 4217 currency codes commonly used

export const CURRENCY_SYMBOLS: Record<string, string> = {
  // Major currencies
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',

  // Americas
  ARS: '$',
  BRL: 'R$',
  CAD: 'C$',
  CLP: '$',
  COP: '$',
  MXN: '$',
  PEN: 'S/',
  UYU: '$U',

  // Europe
  CHF: 'CHF',
  CZK: 'Kč',
  DKK: 'kr',
  HUF: 'Ft',
  NOK: 'kr',
  PLN: 'zł',
  RON: 'lei',
  RUB: '₽',
  SEK: 'kr',
  TRY: '₺',
  UAH: '₴',

  // Asia Pacific
  AUD: 'A$',
  BDT: '৳',
  HKD: 'HK$',
  IDR: 'Rp',
  ILS: '₪',
  KRW: '₩',
  MYR: 'RM',
  NZD: 'NZ$',
  PHP: '₱',
  PKR: '₨',
  SGD: 'S$',
  THB: '฿',
  TWD: 'NT$',
  VND: '₫',

  // Middle East & Africa
  AED: 'د.إ',
  EGP: 'E£',
  KES: 'KSh',
  MAD: 'د.م.',
  NGN: '₦',
  QAR: 'ر.ق',
  SAR: 'ر.س',
  ZAR: 'R',
};

/**
 * Get currency symbol from currency code
 * Falls back to the code itself if not found
 */
export function getCurrencySymbol(code: string | undefined | null): string {
  if (!code) return '€';
  const upperCode = code.toUpperCase();
  return CURRENCY_SYMBOLS[upperCode] || upperCode;
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: number | string,
  currencyCode: string | undefined | null,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return `${symbol}0.00`;

  const formatted = numAmount.toLocaleString(options?.locale || 'en-GB', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });

  return `${symbol}${formatted}`;
}
