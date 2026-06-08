import type { ReactNode } from 'react';
import { ErrorState, LoadingInline } from '@/components/design-system';

type QueryGateProps = {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  errorTitle?: string;
  children: ReactNode;
};

/** Shows loading/error only when there is no cached data to display. */
export function QueryGate({
  isLoading,
  isError,
  hasData,
  onRetry,
  loadingFallback,
  errorTitle = "Couldn't load data",
  children,
}: QueryGateProps) {
  if (isLoading && !hasData) {
    return <>{loadingFallback ?? <LoadingInline />}</>;
  }

  if (isError && !hasData) {
    return <ErrorState title={errorTitle} onRetry={onRetry} />;
  }

  return <>{children}</>;
}
