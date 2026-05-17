// Focuspilot AI - TypeScript Type Definitions

export interface DailyBrief {
  id: string;
  user_id: string;
  content: string;
  generated_at: string;
  items?: BriefItem[];
  user_actions?: UserAction[];
  created_at: string;
}

export interface BriefItem {
  type: 'task' | 'decision' | 'update' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  content: string;
  actionable: boolean;
  completed?: boolean;
  project_id?: string;
  related_entity?: string;
}

export interface UserAction {
  item_id: string;
  action: 'completed' | 'ignored' | 'snoozed';
  timestamp: string;
  time_spent_seconds?: number;
}

export interface EmailAnalysis {
  id: string;
  user_id: string;
  email_id: string;
  category: 'action_required' | 'procurement' | 'fyi';
  project_id?: string;
  entities: EmailEntities;
  summary: string;
  suggested_action?: string;
  processed_at: string;
  created_at: string;
}

export interface EmailEntities {
  suppliers?: string[];
  amounts?: Array<{ value: number; currency: string }>;
  dates?: string[];
  items?: string[];
  people?: string[];
}

export interface AIAction {
  id: string;
  action_type: 'daily_brief' | 'email_categorize' | 'procurement_followup';
  resource_id?: string;
  decision: string;
  reasoning?: string;
  user_id: string;
  can_undo: boolean;
  undone_at?: string;
  created_at: string;
}

export interface AIPreferences {
  id: string;
  user_id: string;
  brief_enabled: boolean;
  brief_time: string; // HH:MM:SS format
  inbox_enabled: boolean;
  procurement_enabled: boolean;
  preferences: {
    tone?: 'formal' | 'casual';
    include_fyi?: boolean;
    notification_channels?: ('email' | 'push' | 'in_app')[];
  };
  created_at: string;
  updated_at: string;
}

export interface GmailToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateBriefResponse {
  brief: DailyBrief;
}

export interface ProcessEmailResponse {
  analysis: EmailAnalysis;
}

export interface AIActivityResponse {
  actions: AIAction[];
  total: number;
  page: number;
  per_page: number;
}

// Procurement AI Types
// Based on research: 178 follow-up decisions/week, 2.3 follow-ups per quote average

export interface StuckQuote {
  id: string;
  procurement_id: string;
  product_name: string;
  supplier: string;
  supplier_id?: string;
  supplier_email?: string;
  project: string;
  project_id?: string;
  room?: string;
  days_waiting: number;
  followup_count: number;
  last_followup?: string;
  quote_requested_at?: string;
  is_critical_path: boolean;
  estimated_value?: number;
  currency?: string;
}

export interface OutOfStockItem {
  id: string;
  procurement_id: string;
  product_name: string;
  product_id?: string;
  supplier: string;
  project: string;
  project_id?: string;
  room?: string;
  detected_at: string;
  previous_status?: string;
  alternatives: string[]; // Product IDs of similar items
  restock_date?: string;
}

export interface ClientRejection {
  id: string;
  procurement_id: string;
  product_name: string;
  product_id?: string;
  client_name?: string;
  client_comment: string;
  project: string;
  project_id?: string;
  room?: string;
  rejected_at: string;
  suggested_alternatives: string[]; // Product IDs
  style_analysis?: string; // AI analysis of what client prefers
}

export interface ProcurementInsight {
  type: 'stuck_quote' | 'out_of_stock' | 'client_rejection' | 'quote_received' | 'delivery_delayed';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  procurement_id: string;
  project_id?: string;
  action_required: boolean;
  action_label?: string;
  action_href?: string;
  created_at: string;
}

export interface FollowUpEmail {
  id: string;
  procurement_id: string;
  supplier_email: string;
  subject: string;
  body: string;
  generated_at: string;
  sent_at?: string;
  status: 'draft' | 'pending_approval' | 'sent' | 'failed';
}

export interface SupplierPerformance {
  supplier_id: string;
  supplier_name: string;
  avg_response_days: number;
  total_quotes: number;
  on_time_delivery_rate: number;
  last_order_date?: string;
  reliability_score: number; // 0-100
}

export interface ProcurementContext {
  stuck_quotes: StuckQuote[];
  out_of_stock: OutOfStockItem[];
  client_rejections: ClientRejection[];
  pending_approvals: number;
  quotes_sent_today: number;
  total_active_procurements: number;
}

// Extended AIAction type for procurement
export type ProcurementActionType =
  | 'quote_followup_sent'
  | 'quote_followup_scheduled'
  | 'stock_change_detected'
  | 'alternative_suggested'
  | 'client_feedback_received'
  | 'quote_received'
  | 'po_created'
  | 'delivery_update';

export interface ProcurementAction extends Omit<AIAction, 'action_type'> {
  action_type: ProcurementActionType;
  supplier?: string;
  project?: string;
  product?: string;
  days_waiting?: number;
}
