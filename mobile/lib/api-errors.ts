export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const data = (error as { response?: { data?: { error?: string; detail?: string } } })?.response?.data;
  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }
  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
