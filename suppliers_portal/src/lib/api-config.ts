function normalizeApiBase(url: string): string {
  return url.replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'http://localhost:8000';
  return normalizeApiBase(url);
}
