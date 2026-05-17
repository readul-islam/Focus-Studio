import useFetch from '@/hooks/useFetch';

export function useCurrency(code: string) {
  const { data: currencyData, isLoading } = useFetch(
    code ? `/user/get-currency-details/?code=${code}` : null,
    { enabled: !!code }
  );

  const defaultCurrency = {
    code: code || "GBP",
    flag: "🇬🇧",
    name: "British Pound Sterling",
    value: code || "GBP",
    symbol: "£"
  };

  return {
    currency: currencyData?.[0] || defaultCurrency,
    isLoading
  };
}
