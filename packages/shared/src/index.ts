export type UserRole = 'admin' | 'manager' | 'member';

export interface Studio {
  id: number;
  name: string;
  default_currency?: string | null;
}

export interface AppUser {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  phone_number?: string;
  profile_picture?: string;
  photoURL?: string;
  title?: string;
  role: UserRole;
  studio?: Studio;
  permissions?: string[];
  is_2fa_enabled?: boolean;
}

export interface NotificationPreferences {
  project_updates: boolean;
  comments: boolean;
  reminders: boolean;
  marketing_emails: boolean;
}

export interface TwoFactorStatus {
  is_enabled: boolean;
  enabled_at?: string | null;
  backup_codes_remaining?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user?: AppUser;
  access?: string;
  refresh?: string;
  requires_2fa?: boolean;
  email?: string;
}

export interface DashboardGreeting {
  name: string;
  message?: string;
  greeting?: string;
  date?: string;
  meetings_today?: string;
  overdue_count?: number;
}

export interface DashboardTask {
  id: number;
  title: string;
  status?: string;
  due_date?: string | null;
  end_date?: string | null;
  project_name?: string;
  project?: string | null;
  priority?: string;
}

export interface DashboardProject {
  id: number;
  name: string;
  progress?: number;
  status?: string;
  pill?: string;
}

export interface DashboardKpi {
  label: string;
  value: string | number;
  trend?: string;
  subtitle?: string;
}

export type DashboardKpiMap = Record<
  string,
  {
    value?: string | number;
    subtitle?: string;
    trend?: string;
  }
>;

export interface DashboardData {
  greeting: DashboardGreeting;
  my_kpis?: DashboardKpi[] | DashboardKpiMap;
  overdue_tasks?: { tasks: DashboardTask[]; count?: number };
  today_meetings?: { summary: string; time?: string }[];
  jump_back_in?: DashboardProject[];
}

export interface TaskItem {
  id: number;
  title: string;
  status: string;
  priority?: string;
  due_date?: string | null;
  end_date?: string | null;
  project?: { id: number; name: string; project_name?: string };
  project_name?: string;
  assignee?: { id: number; name: string };
}

export interface ProjectListItem {
  id: number;
  name: string;
  project_name?: string;
  project_status?: string;
  progress?: number;
  client_name?: string;
  due_date?: string | null;
  end_date?: string | null;
}

export interface ProjectDetail {
  id: number;
  project_name?: string;
  name?: string;
  client_name?: string;
  project_status?: string;
  project_type?: string;
  project_code?: string;
  project_banner?: string | null;
  location?: string | null;
  currency?: string | null;
  progress?: number;
  total_budget?: number;
  spent?: number;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  project_description?: string | null;
}

export interface ProjectOverviewFile {
  id: number;
  name: string;
  url?: string | null;
  type: string;
}

export interface ProjectOverviewActivity {
  type: string;
  name: string;
  updated_at: string;
}

export interface ProjectOverviewData {
  budget_utilization?: {
    total_budget?: number;
    total_po_amount?: number;
    percentage?: number;
  };
  tasks?: {
    total?: number;
    completed?: number;
    in_progress?: number;
    remaining?: number;
    completion_percentage?: number;
  };
  pos_delayed?: { count?: number };
  procurement_status?: { pos_needing_approval?: number; action_required?: boolean };
  latest_files?: ProjectOverviewFile[];
  recent_activity?: ProjectOverviewActivity[];
}

/** @deprecated Use ProjectOverviewData */
export interface ProjectOverview {
  budget_utilization_percentage?: number;
  total_tasks?: number;
  completed_tasks?: number;
  in_progress_tasks?: number;
  remaining_tasks?: number;
  pos_delayed_count?: number;
  pos_needing_approval?: number;
}

export interface ProjectDocument {
  id: number;
  name: string;
  type: 'FILE' | 'FOLDER' | 'LINK';
  file?: string | null;
  link_url?: string | null;
  project?: number | null;
  parent?: number | null;
  item_count?: number | null;
  client_access?: boolean;
  updated_at?: string;
}

export interface ProjectMessageThread {
  thread_id: string;
  subject: string;
  snippet: string;
  sender: string;
  received_at: string;
  is_read: boolean;
}

export interface ProjectMessage {
  id: number;
  sender: string;
  sender_label?: string;
  recipient: string;
  subject: string;
  body: string;
  received_at: string;
  is_sent: boolean;
  is_read: boolean;
  thread_id: string;
  has_attachment?: boolean;
}

export interface InboxThreadProject {
  id: number;
  name: string;
}

export interface InboxThread {
  thread_id: string;
  subject: string;
  snippet: string;
  sender: string;
  received_at: string;
  has_attachment?: boolean;
  is_read: boolean;
  project?: InboxThreadProject | null;
  projects?: InboxThreadProject[];
}

export interface InboxThreadsResponse {
  results: InboxThread[];
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface ProjectPhase {
  id: number;
  name: string;
  color?: string | null;
  progress?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface StudioUser {
  id: number;
  name?: string | null;
  email: string;
  first_name?: string | null;
}

export interface TaskAssignee {
  id: number;
  name?: string | null;
  email?: string;
  first_name?: string | null;
}

export interface TaskAttachment {
  id: number;
  file_name: string;
  file_url?: string | null;
  name?: string;
  file_size?: number;
  content_type?: string;
  created_at: string;
}

export interface TaskComment {
  id: number;
  text: string;
  created_at: string;
  user?: TaskAssignee | null;
}

export interface TaskDetail extends TaskItem {
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  phase?: number | ProjectPhase | null;
  assignees?: TaskAssignee[];
  comments?: TaskComment[];
  subtask?: { id: number; subtask: string; is_completed?: boolean; order?: number }[];
  state?: string;
}

export interface ActiveTimeLog {
  id: number;
  clock_status: 'ON' | 'OFF';
  description?: string | null;
  project?: number | null;
  task?: number | null;
  start_time?: string;
}

export interface TimeLogSummary {
  today: { hours: number; minutes: number };
  this_week: { hours: number; minutes: number };
  this_month: { hours: number; minutes: number };
  daily_breakdown?: { date: string; day: string; hours: number; minutes: number }[];
}

export interface TimeLogItem {
  id: number;
  clock_status?: string;
  description?: string | null;
  duration?: string | null;
  project?: { id: number; project_name?: string; name?: string } | null;
  task?: { id: number; title?: string } | null;
  last_session_start_time?: string | null;
}

export interface NotificationItem {
  id: number;
  notification_type: string;
  message: string;
  is_read: boolean;
  project: number | null;
  task: number | null;
  subtask: number | null;
  created_at: string;
}

export interface NotificationUnreadCount {
  unread_count: number;
}

export interface CalendarPhase {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  project_name?: string | null;
  project_id?: number | null;
  progress?: number;
}

export interface CalendarDelivery {
  id: number;
  ETA: string;
  project_name?: string | null;
  product_name?: string;
}

export interface CalendarGoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  link?: string;
}

export interface IntegrationStatus {
  xero_connected: boolean;
  gmail_connected: boolean;
  calendar_connected: boolean;
  notion_connected?: boolean;
  zapier_configured?: boolean;
}

export type ContactType = 'CL' | 'SP' | 'CN';

export interface CrmContactNote {
  id: number;
  note: string;
  created_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface CrmContact {
  id: number;
  name?: string | null;
  surname?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_type?: ContactType | string | null;
  status?: string | null;
  currency?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  county?: string | null;
  postcode?: string | null;
  country?: string | null;
  additional_contacts?: {
    name?: string;
    relationship?: string;
    email?: string;
    phone?: string;
  }[];
  client_notes?: CrmContactNote[];
  created_at?: string | null;
}

export interface PaginatedContacts {
  count: number;
  next: string | null;
  previous: string | null;
  results: CrmContact[];
}

export type FinanceDocStatus = 'DFT' | 'SNT' | 'APR' | 'PD' | 'OVD';

export interface FinanceParty {
  id?: number;
  name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface FinanceProjectRef {
  id: number;
  project_name?: string;
  name?: string;
}

export interface FinanceLineItem {
  id: number;
  description?: string | null;
  quantity?: number | null;
  unit_price?: number | string | null;
  total?: number | string | null;
  product?: { id: number; name?: string } | null;
}

export interface FinanceInvoice {
  id: number;
  status: FinanceDocStatus | string;
  date?: string | null;
  due_date?: string | null;
  total_amount?: number | string | null;
  currency?: string | null;
  display_invoice?: string;
  project?: FinanceProjectRef | null;
  client?: FinanceParty | null;
  line_items?: FinanceLineItem[];
  delivery_charge?: number | null;
  xero_sync_status?: string | null;
}

export interface FinancePurchaseOrder {
  id: number;
  status: FinanceDocStatus | string;
  date?: string | null;
  due_date?: string | null;
  total_amount?: number | string | null;
  currency?: string | null;
  display_po?: string;
  inv_ref?: number[];
  project?: FinanceProjectRef | null;
  supplier?: FinanceParty | null;
  line_items?: FinanceLineItem[];
  delivery_charge?: number | null;
  xero_sync_status?: string | null;
}

export interface StudioFinanceData {
  invoices: FinanceInvoice[];
  purchase_orders: FinancePurchaseOrder[];
}

export interface ReportTimeBreakdown {
  hours: number;
  minutes: number;
  seconds?: number;
  formatted?: string;
}

export interface ReportProjectTime {
  project_id: number;
  project_name: string;
  total_seconds: number;
  cost?: number;
  total_time?: ReportTimeBreakdown;
  budget_hours?: number | null;
}

export interface ProjectTimeReport {
  studio_name: string;
  projects: ReportProjectTime[];
  studio_total_seconds?: number;
  studio_total_cost?: number;
  studio_total_time?: ReportTimeBreakdown;
}

export interface ReportUserTime {
  user_id: number;
  user_name: string;
  total_seconds: number;
  cost?: number;
  total_time?: ReportTimeBreakdown;
}

export interface UsersTimeReport {
  studio_name?: string;
  users: ReportUserTime[];
  studio_total_seconds: number;
  studio_total_cost: number;
  currency?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ProcurementSummaryItem {
  id: number;
  project_name: string;
  project_id?: number | null;
  room_name?: string;
  product_name?: string;
  supplier_name?: string;
  quantity?: number;
  total_price?: number;
  logistic_status?: string | null;
  eta?: string | null;
  order_date?: string | null;
}

export interface ProcurementSummary {
  items: ProcurementSummaryItem[];
  summary: {
    total_items: number;
    total_spend: number;
    awaiting_delivery: number;
    received: number;
  };
  currency?: string;
}

export const MOBILE_CLIENT_HEADER = 'X-Client-Platform';
export const MOBILE_CLIENT_VALUE = 'mobile';
