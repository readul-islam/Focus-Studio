import type { DashboardData, DashboardKpi, DashboardProject, DashboardTask, TaskItem } from '@focuspilot/shared';

type RawDashboardResponse = DashboardData;

const KPI_LABELS: Record<string, string> = {
  budget_util: 'Budget spent',
  hours_this_week: 'Hours this week',
  projects_active: 'Active projects',
};

export function normalizeDashboardKpis(
  raw?: RawDashboardResponse['my_kpis'],
): DashboardKpi[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  return Object.entries(raw).map(([key, entry]) => {
    const kpi = entry as { value?: string | number; subtitle?: string; trend?: string };
    return {
      label: KPI_LABELS[key] ?? key.replace(/_/g, ' '),
      value: kpi.value ?? '—',
      trend: kpi.trend ?? kpi.subtitle,
    };
  });
}

export function normalizeOverdueTasks(
  raw?: RawDashboardResponse['overdue_tasks'],
): { count: number; tasks: DashboardTask[] } {
  const tasks = (raw?.tasks ?? []).map(task => ({
    id: task.id,
    title: task.title,
    status: task.status ?? 'TD',
    due_date: task.due_date ?? task.end_date ?? null,
    project_name: task.project_name ?? (typeof task.project === 'string' ? task.project : undefined),
    priority: task.priority,
  }));

  return {
    count: raw?.count ?? tasks.length,
    tasks,
  };
}

export function normalizeJumpBackIn(
  raw?: RawDashboardResponse['jump_back_in'],
): DashboardProject[] {
  return (raw ?? []).map(project => ({
    id: project.id,
    name: project.name,
    progress: project.progress,
    status: project.pill ?? project.status,
  }));
}

export function dashboardGreetingLine(
  greeting?: RawDashboardResponse['greeting'],
  fallbackName?: string,
): string {
  if (greeting?.message) return greeting.message;
  const timeGreeting = greeting?.greeting ?? 'Hello';
  const name = fallbackName ?? greeting?.name?.split(' ')[0] ?? '';
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

export function dashboardGreetingSubtitle(greeting?: RawDashboardResponse['greeting']): string | null {
  const parts = [greeting?.date, greeting?.meetings_today].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function normalizeDashboard(data: RawDashboardResponse) {
  return {
    greeting: data.greeting,
    kpis: normalizeDashboardKpis(data.my_kpis),
    overdue: normalizeOverdueTasks(data.overdue_tasks),
    meetings: data.today_meetings ?? [],
    projects: normalizeJumpBackIn(data.jump_back_in),
  };
}

export function getDueSoonTasks(tasks: TaskItem[], limit = 5): TaskItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 7);

  return tasks
    .filter(task => {
      if (task.status === 'D') return false;
      const dueRaw = task.due_date ?? task.end_date;
      if (!dueRaw) return false;
      const due = new Date(dueRaw);
      if (Number.isNaN(due.getTime())) return false;
      due.setHours(0, 0, 0, 0);
      return due >= today && due <= horizon;
    })
    .sort((a, b) => {
      const aDate = new Date(a.due_date ?? a.end_date ?? 0).getTime();
      const bDate = new Date(b.due_date ?? b.end_date ?? 0).getTime();
      return aDate - bDate;
    })
    .slice(0, limit);
}
