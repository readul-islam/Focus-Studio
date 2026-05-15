import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addDays(date: string | Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateObj(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function parseMoney(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}


