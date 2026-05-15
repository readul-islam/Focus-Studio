export interface TimeDuration {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export interface ProjectTime {
  project_id: number;
  project_name: string;
  total_time: TimeDuration;
  total_seconds: number;
  cost?: number;
  total_budget?: number;
  budget_hours?: number;
  budget_hours_seconds?: number;
}

export interface TotalProjectTimeResponse {
  studio_name: string;
  projects: ProjectTime[];
  studio_total_time: TimeDuration;
  studio_total_seconds: number;
  studio_total_cost?: number;
  currency?: string;
}

export interface PhaseTeamMember {
  name: string;
  rate: number;
  hours: number;
}

export interface PhaseTime {
  phase_id: number;
  phase_name: string;
  total_time: TimeDuration;
  total_seconds: number;
  cost?: number;
  total_budget?: number; // acts as Fee
  hour_budget?: number; // acts as Budget Hours
  hour_budget_seconds?: number | null;
  
  // New UI fields (mapped or optional)
  status?: "Complete" | "In Progress" | "Pending";
  team?: PhaseTeamMember[];
  color?: string;
  budget_hours?: number; // easier access
  actual_hours?: number; // easier access
}

export interface ProjectPhaseTimeResponse {
  project_name: string;
  phases: PhaseTime[];
  project_total_time: TimeDuration;
  project_total_seconds: number;
  currency?: string;
  
  // Project level summary for the card
  client?: string;
  total_fee?: number;
  color?: string;
  budget_hours?: number;
  total_hours?: number;
}

export interface TimeLog {
  log_id: number;
  user_name: string;
  task_name: string;
  duration: TimeDuration;
  total_seconds: number;
  description: string;
  created_at: string;
  cost?: number;
  currency?: string;
}

export interface PhaseTimeLogsResponse {
  phase_name: string;
  timelogs: TimeLog[];
}

// User Reports

export interface UserTime {
  user_id: number;
  user_name: string;
  total_time: TimeDuration;
  total_seconds: number;
  cost?: number;
}

export interface UserTimeReportResponse {
  studio_name: string;
  users: UserTime[];
  studio_total_time: TimeDuration;
  studio_total_seconds: number;
  studio_total_cost?: number;
  currency?: string;
  start_date: string | null;
  end_date: string | null;
}

export interface UserTaskTime {
  task_id: number;
  task_title: string;
  project_name: string;
  total_time: TimeDuration;
  total_seconds: number;
  cost?: number;
}

export interface UserDetailedReportResponse {
  user_id: number;
  user_name: string;
  tasks: UserTaskTime[];
  user_total_time: TimeDuration;
  user_total_seconds: number;
  user_total_cost?: number;
  currency?: string;
  start_date: string | null;
  end_date: string | null;
}
