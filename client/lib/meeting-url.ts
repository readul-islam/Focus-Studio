/** Extract Google Meet / Zoom meeting code from a pasted URL or raw code. */
export function extractMeetingId(
  platform: 'google_meet' | 'teams' | 'zoom',
  value: string,
): string {
  const raw = value.trim();
  if (!raw) return raw;

  if (platform === 'google_meet') {
    const urlMatch = raw.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i);
    if (urlMatch) return urlMatch[1].toLowerCase();
    if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(raw)) return raw.toLowerCase();
  }

  if (platform === 'zoom') {
    const zoomMatch = raw.match(/zoom\.us\/j\/(\d+)/i);
    if (zoomMatch) return zoomMatch[1];
  }

  if (raw.includes('/')) {
    return raw.replace(/\/$/, '').split('/').pop() ?? raw;
  }
  return raw;
}

export function buildMeetingUrl(platform: 'google_meet' | 'teams' | 'zoom', meetingId: string): string {
  if (platform === 'google_meet') {
    return `https://meet.google.com/${meetingId}`;
  }
  if (platform === 'zoom') {
    return `https://zoom.us/j/${meetingId}`;
  }
  return meetingId;
}
