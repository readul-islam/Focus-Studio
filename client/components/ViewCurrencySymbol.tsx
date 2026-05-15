import { getCurrencySymbol } from "@/lib/currencySymbols";

export const ViewCurrencySymbol = ({ code }: { code: string | undefined | null }) => {
  return <span>{getCurrencySymbol(code)}</span>;
};
