/** Extract a human-readable message from an axios/API error. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { error?: string; detail?: string } } }).response
      ?.data;
    if (typeof data?.error === 'string' && data.error) return data.error;
    if (typeof data?.detail === 'string' && data.detail) return data.detail;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
