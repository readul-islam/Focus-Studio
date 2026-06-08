import type { AppUser, TaskDetail } from '@focuspilot/shared';
import type { TaskStatusCode } from '@/lib/task-utils';

export type TaskPriority = 'L' | 'M' | 'H';

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatusCode;
  priority: TaskPriority;
  projectId: number | null;
  phaseId: number | null;
  startDate: string;
  dueDate: string;
  assigneeIds: number[];
  pendingSubtasks: string[];
};

export type TaskFormErrors = {
  title?: string;
  phase?: string;
  dates?: string;
  startDate?: string;
  dueDate?: string;
};

export const DEFAULT_TASK_FORM: TaskFormValues = {
  title: '',
  description: '',
  status: 'TD',
  priority: 'L',
  projectId: null,
  phaseId: null,
  startDate: '',
  dueDate: '',
  assigneeIds: [],
  pendingSubtasks: [],
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = 'Task title is required';
  } else if (title.length > 60) {
    errors.title = 'Title must be 60 characters or fewer';
  }

  if (values.projectId && !values.phaseId) {
    errors.phase = 'Select a phase for this project';
  }

  if (values.startDate && !isValidDateString(values.startDate)) {
    errors.startDate = 'Use YYYY-MM-DD';
  }
  if (values.dueDate && !isValidDateString(values.dueDate)) {
    errors.dueDate = 'Use YYYY-MM-DD';
  }

  if (
    values.startDate &&
    values.dueDate &&
    isValidDateString(values.startDate) &&
    isValidDateString(values.dueDate) &&
    values.startDate > values.dueDate
  ) {
    errors.dates = 'Start date must be on or before due date';
  }

  return errors;
}

export function hasTaskFormErrors(errors: TaskFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildTaskPayload(
  values: TaskFormValues,
  user: AppUser,
  options?: { taskId?: number; subtaskIds?: number[]; state?: string },
): Record<string, unknown> {
  const assigneeIds = [...new Set([...(user.id ? [user.id] : []), ...values.assigneeIds])];

  return {
    ...(options?.taskId ? { id: options.taskId } : {}),
    title: values.title.trim(),
    status: values.status,
    priority: values.priority,
    start_date: values.startDate || null,
    end_date: values.dueDate || null,
    description: values.description.trim(),
    state: options?.state ?? 'AC',
    project: values.projectId,
    phase: values.projectId ? values.phaseId : null,
    studio: user.studio?.id ?? null,
    created_by: user.id,
    updated_by: user.id,
    assignees: assigneeIds,
    subtask: options?.subtaskIds ?? [],
  };
}

export function taskDetailToFormValues(task: TaskDetail, userId?: number): TaskFormValues {
  const projectId =
    typeof task.project === 'object' && task.project?.id
      ? task.project.id
      : typeof task.project === 'number'
        ? task.project
        : null;

  const phaseId =
    typeof task.phase === 'object' && task.phase?.id
      ? task.phase.id
      : typeof task.phase === 'number'
        ? task.phase
        : null;

  const assigneeIds =
    task.assignees
      ?.map(a => a.id)
      .filter(id => id !== userId) ?? [];

  return {
    title: task.title ?? '',
    description: task.description ?? '',
    status: (task.status as TaskStatusCode) ?? 'TD',
    priority: (task.priority as TaskPriority) ?? 'L',
    projectId,
    phaseId,
    startDate: task.start_date ?? '',
    dueDate: task.end_date ?? task.due_date ?? '',
    assigneeIds,
    pendingSubtasks: [],
  };
}

export function studioUserLabel(user: { name?: string | null; first_name?: string | null; email: string }): string {
  if (user.name?.trim()) return user.name.trim();
  if (user.first_name?.trim()) return user.first_name.trim();
  return user.email.split('@')[0] ?? user.email;
}
