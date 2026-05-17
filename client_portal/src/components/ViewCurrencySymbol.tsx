import { useCurrency } from "@/hooks/getCurrencySymbol";


export const ViewCurrencySymbol = ({code}: {code: string}) => {
    const { currency, isLoading } = useCurrency(code);
    return(
        <span>{isLoading ? '...' : currency.symbol}</span>
    )
}