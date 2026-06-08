import { colors } from '@/constants/theme';

export type TaskStatusCode = 'TD' | 'IP' | 'IR' | 'D' | string;

export const TASK_STATUS_OPTIONS = [
  { code: 'TD', label: 'To-do', color: colors.textMuted, bg: colors.surfaceElevated },
  { code: 'IP', label: 'In progress', color: colors.brand, bg: '#eef2ff' },
  { code: 'IR', label: 'In review', color: colors.clay, bg: '#fff7ed' },
  { code: 'D', label: 'Done', color: colors.success, bg: '#ecfdf5' },
] as const;

export function taskStatusLabel(status: TaskStatusCode): string {
  return TASK_STATUS_OPTIONS.find(s => s.code === status)?.label ?? status.replace(/_/g, ' ');
}

export function taskStatusStyle(status: TaskStatusCode) {
  return TASK_STATUS_OPTIONS.find(s => s.code === status) ?? TASK_STATUS_OPTIONS[0];
}

export function priorityLabel(priority?: string | null): string {
  switch (priority) {
    case 'H':
      return 'High';
    case 'M':
      return 'Medium';
    case 'L':
      return 'Low';
    default:
      return priority ?? '';
  }
}

export function priorityColor(priority?: string | null): string {
  switch (priority) {
    case 'H':
      return colors.danger;
    case 'M':
      return colors.warning;
    case 'L':
      return colors.textMuted;
    default:
      return colors.textMuted;
  }
}
