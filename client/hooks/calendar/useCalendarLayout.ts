import { useMemo } from 'react';
import {
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

export interface LayoutItem {
  id: number | string;
  startDate: Date;
  endDate: Date;
  [key: string]: any;
}

export function useCalendarLayout() {
  const getLayoutRows = useMemo(
    () => (items: LayoutItem[], rangeStart: Date, rangeEnd: Date, granularity: 'day' | 'week' | 'month' = 'day') => {
      const sorted = [...items].sort((a, b) => {
        // Prioritize start date (earlier first)
        const startDiff = a.startDate.getTime() - b.startDate.getTime();
        if (startDiff !== 0) return startDiff;

        // Then duration (longer first)
        const durA = differenceInDays(a.endDate, a.startDate);
        const durB = differenceInDays(b.endDate, b.startDate);
        return durB - durA;
      });

      const rows: LayoutItem[][] = [];

      sorted.forEach((item) => {
        const itemStart = item.startDate < rangeStart ? rangeStart : item.startDate;
        const itemEnd = item.endDate > rangeEnd ? rangeEnd : item.endDate;

        if (item.endDate < rangeStart || item.startDate > rangeEnd) return;

        let rowIndex = 0;
        while (true) {
          if (!rows[rowIndex]) {
            rows[rowIndex] = [];
          }

          const hasCollision = rows[rowIndex].some((existing) => {
            let existingStart = existing.startDate < rangeStart ? rangeStart : existing.startDate;
            let existingEnd = existing.endDate > rangeEnd ? rangeEnd : existing.endDate;

            let checkItemStart = itemStart;
            let checkItemEnd = itemEnd;

            if (granularity === 'month') {
              existingStart = startOfMonth(existingStart);
              existingEnd = endOfMonth(existingEnd);
              checkItemStart = startOfMonth(checkItemStart);
              checkItemEnd = endOfMonth(checkItemEnd);
            } else if (granularity === 'week') {
              existingStart = startOfWeek(existingStart);
              existingEnd = endOfWeek(existingEnd);
              checkItemStart = startOfWeek(checkItemStart);
              checkItemEnd = endOfWeek(checkItemEnd);
            }

            return checkItemStart <= existingEnd && checkItemEnd >= existingStart;
          });

          if (!hasCollision) {
            rows[rowIndex].push(item);
            break;
          }
          rowIndex++;
        }
      });

      return rows;
    },
    []
  );

  return { getLayoutRows };
}
