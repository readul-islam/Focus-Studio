import { parse } from 'date-fns';

/** Parse YYYY-MM-DD as a local calendar date (avoids UTC off-by-one in month grids). */
export function parseCalendarDate(value: string | Date | null | undefined): Date | null {
    if (value == null || value === '') return null;
    const str = value.toString().substring(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    return parse(str, 'yyyy-MM-dd', new Date());
}
