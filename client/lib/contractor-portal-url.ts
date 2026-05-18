const DEFAULT_CONTRACTOR_PORTAL_URL = 'https://contractors.focuspilot.io';

export function getContractorPortalBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CONTRACTOR_PORTAL_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3002';
  }
  return DEFAULT_CONTRACTOR_PORTAL_URL;
}

export function getProjectPortalUrl(accessToken: string): string {
  return `${getContractorPortalBaseUrl()}/project/${accessToken}`;
}
