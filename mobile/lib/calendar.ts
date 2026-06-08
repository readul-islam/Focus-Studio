import type { CalendarDelivery, CalendarGoogleEvent, CalendarPhase } from '@focuspilot/shared';

export type CalendarEntryType = 'phase' | 'delivery' | 'meeting';
export type CalendarFilter = 'all' | 'phases' | 'delivery' | 'meetings';

export interface CalendarEntry {
  id: string;
  type: CalendarEntryType;
  title: string;
  subtitle?: string;
  date: Date;
  endDate?: Date;
  projectId?: number;
  timeLabel?: string;
  link?: string;
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function parseCalendarDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

export function parseEventDate(value?: string): Date | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseCalendarDate(value);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, date.getDate());
}

export function addDays(date: Date, count: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + count);
  return copy;
}

export function getMonthGridDays(month: Date): Date[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const gridStart = new Date(start);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(end);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days: Date[] = [];
  const current = new Date(gridStart);
  while (current <= gridEnd) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatSelectedDay(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatEventTime(value: string): string {
  const date = parseEventDate(value);
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'All day';
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function phaseOverlapsDay(phase: { startDate: Date; endDate: Date }, day: Date): boolean {
  const dayTime = startOfDay(day).getTime();
  const startTime = startOfDay(phase.startDate).getTime();
  const endTime = startOfDay(phase.endDate).getTime();
  return dayTime >= startTime && dayTime <= endTime;
}

export function buildPhaseEntries(phases: CalendarPhase[]): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  phases.forEach(phase => {
    const startDate = parseCalendarDate(phase.start_date);
    const endDate = parseCalendarDate(phase.end_date);
    if (!startDate || !endDate) return;
    entries.push({
      id: `phase-${phase.id}`,
      type: 'phase',
      title: phase.name,
      subtitle: phase.project_name ?? undefined,
      date: startDate,
      endDate,
      projectId: phase.project_id ?? undefined,
    });
  });
  return entries;
}

export function buildDeliveryEntries(deliveries: CalendarDelivery[]): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  deliveries.forEach(delivery => {
    const date = parseCalendarDate(delivery.ETA);
    if (!date) return;
    entries.push({
      id: `delivery-${delivery.id}`,
      type: 'delivery',
      title: delivery.product_name ?? 'Delivery',
      subtitle: delivery.project_name ?? undefined,
      date,
    });
  });
  return entries;
}

export function buildMeetingEntries(events: CalendarGoogleEvent[]): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  events.forEach(event => {
    const date = parseEventDate(event.start);
    if (!date) return;
    entries.push({
      id: `meeting-${event.id}`,
      type: 'meeting',
      title: event.summary,
      subtitle: event.location || undefined,
      date,
      timeLabel: formatEventTime(event.start),
      link: event.link,
    });
  });
  return entries;
}

export function entriesForDay(entries: CalendarEntry[], day: Date, filter: CalendarFilter): CalendarEntry[] {
  return entries.filter(entry => {
    if (filter === 'phases' && entry.type !== 'phase') return false;
    if (filter === 'delivery' && entry.type !== 'delivery') return false;
    if (filter === 'meetings' && entry.type !== 'meeting') return false;

    if (entry.type === 'phase' && entry.endDate) {
      return phaseOverlapsDay({ startDate: entry.date, endDate: entry.endDate }, day);
    }
    return isSameDay(entry.date, day);
  });
}

export function daysWithEntries(entries: CalendarEntry[], days: Date[], filter: CalendarFilter): Set<string> {
  const result = new Set<string>();
  days.forEach(day => {
    if (entriesForDay(entries, day, filter).length > 0) {
      result.add(toDateKey(day));
    }
  });
  return result;
}

export function getMonthFetchRange(month: Date) {
  const rangeStart = addDays(startOfMonth(month), -7);
  const rangeEnd = addDays(endOfMonth(month), 7);
  return {
    timeMin: rangeStart.toISOString(),
    timeMax: rangeEnd.toISOString(),
  };
}
