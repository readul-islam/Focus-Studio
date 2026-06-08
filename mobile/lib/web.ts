import { Linking } from 'react-native';

function normalizeWebBase(url: string): string {
  return url.replace(/\/$/, '');
}

/** Studio web app base URL — for OAuth and settings that require the browser. */
export function getStudioWebUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL;
  if (fromEnv) {
    return normalizeWebBase(fromEnv);
  }
  return 'http://localhost:3000';
}

export function studioWebPath(path: string): string {
  const base = getStudioWebUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function openStudioWebPath(path: string): Promise<void> {
  const url = studioWebPath(path);
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('Cannot open studio web app URL');
  }
  await Linking.openURL(url);
}
