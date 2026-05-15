import { getCurrencySymbol, CURRENCY_SYMBOLS } from './currencySymbols';

// Re-export for convenience
export { getCurrencySymbol, CURRENCY_SYMBOLS };

/**
 * Hook for currency data - now uses static map (no API calls)
 * Kept for backward compatibility with existing code
 */
export function useCurrency(code: string | undefined | null) {
  const symbol = getCurrencySymbol(code);

  const currency = {
    code: code || 'GBP',
    symbol,
    name: code || 'British Pound Sterling',
    value: code || 'GBP',
  };

  return {
    currency,
    isLoading: false, // Always false now - no API calls
  };
}
