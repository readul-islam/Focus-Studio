// Contractor Portal - TypeScript Type Definitions

// Trade types for filtering
export type TradeType = 'Plumbing' | 'Electrical' | 'Joinery' | 'General';

// Trade options for contractor management dropdowns
export const TRADE_OPTIONS = [
  'Builder',
  'Electrician',
  'Plumber',
  'Joiner',
  'Plasterer',
  'Decorator',
  'Other',
] as const;

// Trade configuration - what each trade needs to see
export const TRADE_CONFIG: Record<TradeType, {
  label: string;
  relevantRooms: string[];
  icon: string;
  description: string;
}> = {
  Plumbing: {
    label: 'Plumbing',
    relevantRooms: ['Bathroom', 'Kitchen', 'Laundry', 'Utility', 'Master Bathroom', 'Guest Bathroom', 'En-suite'],
    icon: 'Wrench',
    description: 'Fixtures, pipes, underfloor heating',
  },
  Electrical: {
    label: 'Electrical',
    relevantRooms: ['Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Office', 'Dining Room'],
    icon: 'Zap',
    description: 'Lighting, outlets, smart systems',
  },
  Joinery: {
    label: 'Joinery',
    relevantRooms: ['Kitchen', 'Bedroom', 'Living Room', 'Bathroom', 'Office', 'Hallway'],
    icon: 'Hammer',
    description: 'Cabinetry, doors, built-ins',
  },
  General: {
    label: 'Builder / GC',
    relevantRooms: ['All'],
    icon: 'HardHat',
    description: 'Project coordination, all trades',
  },
};

export interface ContractorProject {
  id: string;
  name: string;
  client_name?: string;
  address?: string;
  status: 'active' | 'completed' | 'on_hold';
  logo_url?: string;
  created_at: string;
}

export interface ContractorProcurementItem {
  id: string;
  product_name: string;
  product_image?: string;
  room: string;
  status: 'ordered' | 'in_transit' | 'delivered' | 'installed' | 'on_site';
  eta?: string;
  delivery_date?: string;
  quantity: number;
  notes?: string;
  trade: TradeType;  // Required - for filtering
  updated_at: string;
}

export interface ContractorDrawing {
  id: string;
  name: string;
  file_url: string;
  thumbnail_url?: string;
  version: string;
  uploaded_at: string;
  revised_at?: string;
  file_type: 'pdf' | 'dwg' | 'image' | 'other';
  file_size?: number;
  room?: string;
  trade: TradeType;  // Required - for filtering
  surveyed: boolean;
  surveyed_at?: string;
  surveyed_by?: string;
  survey_notes?: string;
}

export interface ContractorActivity {
  id: string;
  type: 'procurement_update' | 'drawing_revision' | 'drawing_added' | 'message' | 'status_change' | 'item_shared' | 'drawing_shared' | 'portal_accessed' | 'item_viewed' | 'drawing_viewed' | 'drawing_confirmed';
  title: string;
  description?: string;
  timestamp: string;
  read: boolean;
  related_id?: string;
}

export interface ContractorPortalData {
  project: ContractorProject;
  procurement_items: ContractorProcurementItem[];
  drawings: ContractorDrawing[];
  activities: ContractorActivity[];
  contractor_name: string;
  trade: TradeType;
  messages: ContractorMessage[];
}

// Builder-specific coordination data
export interface TradeScheduleItem {
  trade: TradeType;
  contractor_name: string;
  phase: 'rough_in' | 'first_fix' | 'installation' | 'finishing';
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'complete';
}

export interface BuilderCoordinationData {
  project: ContractorProject;
  trade_schedule: TradeScheduleItem[];
  upcoming_deliveries: ContractorProcurementItem[];
  all_trades_summary: {
    trade: TradeType;
    total_items: number;
    delivered: number;
    pending: number;
  }[];
}

export interface ContractorKPI {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  alert?: boolean;
}

export interface DrawingSurveyConfirmation {
  drawing_id: string;
  confirmed: boolean;
  notes?: string;
  confirmed_at?: string;
  confirmed_by?: string;
}

// Sharing types for contractor management
export interface ContractorShare {
  id: string;
  contractor_id: string;
  item_type: 'procurement' | 'drawing';
  item_id: string;
  item_name: string;
  shared_at: string;
  shared_by: string;
  viewed_at?: string;
  view_count: number;
}

export type InsuranceWarning = 'expired' | 'expiring_soon' | 'valid' | null;

export interface ProjectContractor {
  id: string;
  name: string;
  trade: TradeType;
  trade_label?: string;
  access_code?: string;
  insurance_expiry?: string;
  insurance_warning?: InsuranceWarning;
  insurance_document?: string;
  trade_cert?: string;
  token: string;
  status: 'invited' | 'active' | 'inactive';
  created_at: string;
  last_accessed?: string;
  shared_items: ContractorShare[];
  shared_drawings: ContractorShare[];
  activities: ContractorActivity[];
  messages: ContractorMessage[];
}

// Extended activity types for sharing
export type ContractorActivityType =
  | 'procurement_update'
  | 'drawing_revision'
  | 'drawing_added'
  | 'message'
  | 'status_change'
  | 'item_shared'
  | 'drawing_shared'
  | 'portal_accessed'
  | 'item_viewed'
  | 'drawing_viewed'
  | 'drawing_confirmed';

// Messaging types for 2-way chat
export interface ContractorMessage {
  id: string;
  contractor_id: string;
  sender: 'studio' | 'contractor';
  sender_name: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ContractorMessageThread {
  contractor_id: string;
  contractor_name: string;
  messages: ContractorMessage[];
  unread_count: number;
  last_message_at?: string;
}