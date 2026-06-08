import type { ActiveTimeLog } from '@focuspilot/shared';

export function parseActiveTimeLog(data: unknown): ActiveTimeLog | null {
  if (!data || typeof data === 'string') return null;
  if (typeof data === 'object' && data !== null && 'id' in data && 'clock_status' in data) {
    return data as ActiveTimeLog;
  }
  return null;
}

export function formatDurationParts(hours: number, minutes: number): string {
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatHoursMinutes(hours: number, minutes: number): string {
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}
