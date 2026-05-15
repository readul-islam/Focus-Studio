// Mock data for testing AI features before backend is ready

import type { DailyBrief, EmailAnalysis, AIAction } from './types';
import type { AttentionItem } from '@/components/ai/NeedsAttentionCard';
import type { ScheduleItem } from '@/components/ai/TodayScheduleCard';

export const mockDailyBrief: DailyBrief = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  content: `Good morning Sarah. I've noticed you've been focusing on the Hampstead project this week, which is progressing well. However, the Devol kitchen quote requires your approval today to stay on track for next week's delivery. Marcus is waiting for site access confirmation too - a quick message to him would keep things moving smoothly.

On the Chelsea Penthouse, everything is quiet right now, so you can focus your energy where it's needed most. The budget tracking shows you're well within limits across all active projects, which is excellent news.

I've also noticed three supplier invoices from last week that need processing. They're all routine, but getting them cleared today would help maintain good relationships with your suppliers.`,
  generated_at: new Date().toISOString(),
  items: [
    {
      type: 'decision',
      priority: 'high',
      content: 'Approve Devol kitchen quote for Hampstead project',
      actionable: true,
      completed: false,
      project_id: 'proj-hampstead-001',
      related_entity: 'Devol Kitchens'
    },
    {
      type: 'task',
      priority: 'medium',
      content: 'Confirm site access with Marcus',
      actionable: true,
      completed: false,
      project_id: 'proj-hampstead-001',
      related_entity: 'Marcus (site manager)'
    },
    {
      type: 'reminder',
      priority: 'medium',
      content: 'Process three supplier invoices from last week',
      actionable: true,
      completed: false
    }
  ],
  user_actions: [],
  created_at: new Date().toISOString()
};

export const mockEmptyBrief: DailyBrief = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  content: `Good morning Sarah. Today looks wonderfully calm - all your projects are running smoothly with no urgent matters requiring attention. This is a perfect opportunity to focus on any strategic planning or creative work you've been wanting to tackle.`,
  generated_at: new Date().toISOString(),
  items: [],
  user_actions: [],
  created_at: new Date().toISOString()
};

export const mockLongBrief: DailyBrief = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  content: `Good morning Sarah. It's shaping up to be quite a busy day, but I've organised everything by priority to help you focus on what truly matters.

First, the Hampstead project needs your attention urgently. The Devol kitchen quote (£18,500) requires approval by end of day to maintain the delivery schedule for next week. Marcus has also been waiting for site access confirmation since Tuesday - a quick email to him would unblock the team's progress. Additionally, the bathroom tiles sample from Fired Earth arrived yesterday and is ready for your review.

On the Chelsea Penthouse front, the client has requested a design consultation for next Friday at 2pm. I've checked your calendar and you're free, so confirming this meeting would be helpful. The fabric samples from Romo are also overdue for selection - the supplier mentioned they need confirmation by Thursday to meet your installation timeline.

Administratively, there are three supplier invoices awaiting processing (totalling £4,200), and the monthly budget reports are ready for your review. Everything is tracking well financially, with all projects within their allocated budgets. The Kensington Townhouse project is progressing beautifully with no immediate actions needed from you.

I'd suggest tackling the Hampstead approvals first thing this morning, then the Chelsea consultation confirmation. The administrative tasks can wait until this afternoon when things typically quieten down. You're doing brilliant work managing all these projects simultaneously.`,
  generated_at: new Date().toISOString(),
  items: [
    {
      type: 'decision',
      priority: 'high',
      content: 'Approve Devol kitchen quote (£18,500) for Hampstead',
      actionable: true,
      completed: false,
      project_id: 'proj-hampstead-001',
      related_entity: 'Devol Kitchens'
    },
    {
      type: 'task',
      priority: 'high',
      content: 'Confirm site access with Marcus',
      actionable: true,
      completed: false,
      project_id: 'proj-hampstead-001',
      related_entity: 'Marcus'
    },
    {
      type: 'task',
      priority: 'medium',
      content: 'Review bathroom tiles sample from Fired Earth',
      actionable: true,
      completed: false,
      project_id: 'proj-hampstead-001',
      related_entity: 'Fired Earth'
    },
    {
      type: 'task',
      priority: 'medium',
      content: 'Confirm design consultation for Chelsea Penthouse (Friday 2pm)',
      actionable: true,
      completed: false,
      project_id: 'proj-chelsea-001'
    },
    {
      type: 'decision',
      priority: 'medium',
      content: 'Select fabric samples from Romo (due Thursday)',
      actionable: true,
      completed: false,
      project_id: 'proj-chelsea-001',
      related_entity: 'Romo'
    },
    {
      type: 'task',
      priority: 'low',
      content: 'Process three supplier invoices (£4,200 total)',
      actionable: true,
      completed: false
    },
    {
      type: 'update',
      priority: 'low',
      content: 'Review monthly budget reports',
      actionable: true,
      completed: false
    }
  ],
  user_actions: [],
  created_at: new Date().toISOString()
};

export const mockEmailAnalysis: EmailAnalysis = {
  id: '660e8400-e29b-41d4-a716-446655440000',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  email_id: 'email-001',
  category: 'action_required',
  project_id: 'proj-hampstead-001',
  entities: {
    suppliers: ['Devol Kitchens'],
    amounts: [{ value: 18500, currency: 'GBP' }],
    dates: ['2026-01-30'],
    items: ['Kitchen cabinets', 'Worktop', 'Handles'],
    people: ['Marcus Thompson']
  },
  summary: 'Quote received from Devol Kitchens for Hampstead project kitchen. Requires approval by end of week to maintain delivery schedule.',
  suggested_action: 'Review quote and approve if pricing aligns with budget. Coordinate with Marcus for delivery timing.',
  processed_at: new Date().toISOString(),
  created_at: new Date().toISOString()
};

export const mockAIActions: AIAction[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440000',
    action_type: 'daily_brief',
    resource_id: mockDailyBrief.id,
    decision: 'Generated daily brief',
    reasoning: 'User has 3 high-priority items requiring attention today',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    can_undo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    action_type: 'email_categorize',
    resource_id: mockEmailAnalysis.id,
    decision: 'Categorised as Action Required',
    reasoning: 'Email contains quote requiring approval with time-sensitive deadline',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    can_undo: false,
    created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    action_type: 'procurement_followup',
    resource_id: 'quote-003',
    decision: 'Sent gentle follow-up email to supplier',
    reasoning: 'No response received for 7 days, not on critical path so gentle follow-up appropriate',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    can_undo: false,
    created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  }
];

// Mock Needs Attention items for dashboard
export const mockNeedsAttention: AttentionItem[] = [
  {
    id: 'att-001',
    type: 'quote',
    title: 'Quote overdue: Dining Table',
    subtitle: 'Hampstead Project',
    priority: 'high',
    dueText: 'Approval needed today',
    href: '/projects/proj-hampstead-001',
  },
  {
    id: 'att-002',
    type: 'decision',
    title: 'Client decision needed',
    subtitle: 'Chelsea Penthouse - Fabric selection',
    priority: 'high',
    dueText: 'Due by Thursday',
    href: '/projects/proj-chelsea-001',
  },
  {
    id: 'att-003',
    type: 'followup',
    title: 'Vendor follow-up',
    subtitle: 'Devol Kitchens - no response 5 days',
    priority: 'medium',
    dueText: 'Consider gentle follow-up',
  },
  {
    id: 'att-004',
    type: 'task',
    title: 'Site visit confirmation',
    subtitle: 'Confirm with Marcus',
    priority: 'medium',
    href: '/projects/proj-hampstead-001',
  },
];

export const mockTodaySchedule: ScheduleItem[] = [
  {
    id: 'sch-001',
    title: 'Team standup',
    time: '09:30',
    endTime: '10:00',
    type: 'meeting',
    attendees: 4,
    href: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'sch-002',
    title: 'Client call - Fabric selection',
    time: '14:00',
    endTime: '15:00',
    type: 'call',
    attendees: 2,
    location: 'Zoom',
    href: 'https://zoom.us/j/123456789',
  },
  {
    id: 'sch-003',
    title: 'Site visit with contractor',
    time: '16:00',
    endTime: '17:30',
    type: 'site_visit',
    location: 'Hampstead',
    attendees: 3,
  },
];

export const mockEmptySchedule: ScheduleItem[] = [];

export const mockEmptyAttention: AttentionItem[] = [];

// Helper function to simulate API delay
export function simulateAPIDelay<T>(data: T, delay: number = 800): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

// Mock API error
export const mockAPIError = {
  response: {
    data: {
      message: 'Failed to generate brief. Please try again.'
    }
  },
  message: 'Network error'
};

// =============================================================================
// PROCUREMENT AI MOCK DATA
// Based on research: 178 follow-up decisions/week, 2.3 follow-ups per quote avg
// =============================================================================

import type {
  StuckQuote,
  OutOfStockItem,
  ClientRejection,
  ProcurementInsight,
  SupplierPerformance,
  ProcurementContext,
  ProcurementAction,
} from './types';

// Stuck Quotes - quotes with no response >3 days
export const mockStuckQuotes: StuckQuote[] = [
  {
    id: 'sq-001',
    procurement_id: 'proc-123',
    product_name: 'Carrara Marble Slabs',
    supplier: 'Carrara & Co',
    supplier_id: 'sup-carrara',
    supplier_email: 'orders@carraramarble.co.uk',
    project: 'Chelsea Penthouse',
    project_id: 'proj-chelsea-001',
    room: 'Master Bathroom',
    days_waiting: 8,
    followup_count: 1,
    last_followup: '2026-01-20T09:30:00Z',
    quote_requested_at: '2026-01-15T10:00:00Z',
    is_critical_path: true,
    estimated_value: 12500,
    currency: 'GBP',
  },
  {
    id: 'sq-002',
    procurement_id: 'proc-456',
    product_name: 'Bespoke Oak Flooring',
    supplier: 'Havwoods',
    supplier_id: 'sup-havwoods',
    supplier_email: 'trade@havwoods.co.uk',
    project: 'Hampstead Renovation',
    project_id: 'proj-hampstead-001',
    room: 'Living Room',
    days_waiting: 5,
    followup_count: 0,
    quote_requested_at: '2026-01-18T14:00:00Z',
    is_critical_path: false,
    estimated_value: 8900,
    currency: 'GBP',
  },
  {
    id: 'sq-003',
    procurement_id: 'proc-789',
    product_name: 'Custom Joinery - Bookcase',
    supplier: 'Mowlem & Co',
    supplier_id: 'sup-mowlem',
    supplier_email: 'enquiries@mowlem.co.uk',
    project: 'Notting Hill Townhouse',
    project_id: 'proj-nottinghill-001',
    room: 'Study',
    days_waiting: 4,
    followup_count: 0,
    quote_requested_at: '2026-01-19T11:00:00Z',
    is_critical_path: false,
    estimated_value: 15000,
    currency: 'GBP',
  },
];

// Out of Stock Items - products no longer available
export const mockOutOfStock: OutOfStockItem[] = [
  {
    id: 'oos-001',
    procurement_id: 'proc-234',
    product_name: 'Devol Brass Kitchen Tap',
    product_id: 'prod-devol-tap-001',
    supplier: 'Devol Kitchens',
    project: 'Chelsea Penthouse',
    project_id: 'proj-chelsea-001',
    room: 'Kitchen',
    detected_at: '2026-01-23T07:45:00Z',
    previous_status: 'in_stock',
    alternatives: ['prod-samuel-heath-001', 'prod-perrin-rowe-001', 'prod-lefroy-brooks-001'],
    restock_date: '2026-03-15',
  },
  {
    id: 'oos-002',
    procurement_id: 'proc-567',
    product_name: 'Porta Romana Orion Chandelier',
    product_id: 'prod-porta-chandelier-001',
    supplier: 'Porta Romana',
    project: 'Chelsea Penthouse',
    project_id: 'proj-chelsea-001',
    room: 'Dining Room',
    detected_at: '2026-01-23T07:45:00Z',
    previous_status: 'low_stock',
    alternatives: ['prod-vaughan-001', 'prod-bella-figura-001'],
  },
];

// Client Rejections - items client didn't approve
export const mockClientRejections: ClientRejection[] = [
  {
    id: 'rej-001',
    procurement_id: 'proc-890',
    product_name: 'Minotti Powell Armchair',
    product_id: 'prod-minotti-001',
    client_name: 'Mrs. Hartley',
    client_comment: 'Too modern, prefer something more traditional',
    project: 'Chelsea Penthouse',
    project_id: 'proj-chelsea-001',
    room: 'Drawing Room',
    rejected_at: '2026-01-22T23:32:00Z',
    suggested_alternatives: ['prod-george-smith-001', 'prod-kingcome-001'],
    style_analysis: 'Client prefers traditional English style. Previously approved George Smith sofa and antique pieces.',
  },
  {
    id: 'rej-002',
    procurement_id: 'proc-891',
    product_name: 'Christopher Guy Mirror',
    product_id: 'prod-cg-mirror-001',
    client_name: 'Mrs. Hartley',
    client_comment: 'Frame too ornate for the space',
    project: 'Chelsea Penthouse',
    project_id: 'proj-chelsea-001',
    room: 'Entrance Hall',
    rejected_at: '2026-01-22T23:35:00Z',
    suggested_alternatives: ['prod-vaughan-mirror-001', 'prod-julian-chichester-001'],
    style_analysis: 'Client prefers simpler, cleaner frames. Consider understated designs.',
  },
];

// Procurement Insights - surfaced on procurement page
export const mockProcurementInsights: ProcurementInsight[] = [
  {
    type: 'stuck_quote',
    severity: 'urgent',
    title: 'Quote overdue: Carrara Marble (8 days)',
    description: 'Carrara & Co hasn\'t responded. This is on the critical path for bathroom installation.',
    procurement_id: 'proc-123',
    project_id: 'proj-chelsea-001',
    action_required: true,
    action_label: 'Send follow-up',
    created_at: '2026-01-23T07:30:00Z',
  },
  {
    type: 'out_of_stock',
    severity: 'warning',
    title: 'Devol Brass Tap now out of stock',
    description: '3 alternatives found in your library. Expected restock: March 2026.',
    procurement_id: 'proc-234',
    project_id: 'proj-chelsea-001',
    action_required: true,
    action_label: 'View alternatives',
    created_at: '2026-01-23T07:45:00Z',
  },
  {
    type: 'client_rejection',
    severity: 'warning',
    title: 'Client feedback: Minotti Armchair',
    description: '"Too modern, prefer traditional" - 2 alternatives suggested.',
    procurement_id: 'proc-890',
    project_id: 'proj-chelsea-001',
    action_required: true,
    action_label: 'Review feedback',
    created_at: '2026-01-22T23:32:00Z',
  },
  {
    type: 'stuck_quote',
    severity: 'warning',
    title: 'Quote pending: Havwoods Flooring (5 days)',
    description: 'No follow-up sent yet. Not on critical path.',
    procurement_id: 'proc-456',
    project_id: 'proj-hampstead-001',
    action_required: false,
    created_at: '2026-01-23T07:30:00Z',
  },
];

// Supplier Performance - for AI recommendations
export const mockSupplierPerformance: SupplierPerformance[] = [
  {
    supplier_id: 'sup-porta-romana',
    supplier_name: 'Porta Romana',
    avg_response_days: 1.8,
    total_quotes: 24,
    on_time_delivery_rate: 0.95,
    last_order_date: '2026-01-10',
    reliability_score: 92,
  },
  {
    supplier_id: 'sup-devol',
    supplier_name: 'Devol Kitchens',
    avg_response_days: 4.2,
    total_quotes: 18,
    on_time_delivery_rate: 0.88,
    last_order_date: '2025-12-15',
    reliability_score: 78,
  },
  {
    supplier_id: 'sup-carrara',
    supplier_name: 'Carrara & Co',
    avg_response_days: 8.3,
    total_quotes: 12,
    on_time_delivery_rate: 0.75,
    last_order_date: '2025-11-20',
    reliability_score: 55,
  },
  {
    supplier_id: 'sup-havwoods',
    supplier_name: 'Havwoods',
    avg_response_days: 3.1,
    total_quotes: 31,
    on_time_delivery_rate: 0.92,
    last_order_date: '2026-01-18',
    reliability_score: 85,
  },
  {
    supplier_id: 'sup-stone-gallery',
    supplier_name: 'Stone Gallery',
    avg_response_days: 2.4,
    total_quotes: 15,
    on_time_delivery_rate: 0.90,
    last_order_date: '2026-01-05',
    reliability_score: 88,
  },
];

// Full Procurement Context - for Daily Brief
export const mockProcurementContext: ProcurementContext = {
  stuck_quotes: mockStuckQuotes,
  out_of_stock: mockOutOfStock,
  client_rejections: mockClientRejections,
  pending_approvals: 5,
  quotes_sent_today: 2,
  total_active_procurements: 47,
};

// Procurement Actions - for AI Activity feed
export const mockProcurementActions: ProcurementAction[] = [
  {
    id: 'pa-001',
    action_type: 'quote_followup_sent',
    resource_id: 'proc-123',
    decision: 'Sent follow-up to Carrara & Co',
    reasoning: 'Quote pending 8 days, on critical path for bathroom installation. Sent polite follow-up email.',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    can_undo: true,
    created_at: new Date().toISOString(),
    supplier: 'Carrara & Co',
    project: 'Chelsea Penthouse',
    product: 'Carrara Marble Slabs',
    days_waiting: 8,
  },
  {
    id: 'pa-002',
    action_type: 'stock_change_detected',
    resource_id: 'proc-234',
    decision: 'Detected: Devol Brass Tap now out of stock',
    reasoning: 'Product status changed from in_stock to out_of_stock. Found 3 similar alternatives in library.',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    can_undo: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    supplier: 'Devol Kitchens',
    project: 'Chelsea Penthouse',
    product: 'Devol Brass Kitchen Tap',
  },
  {
    id: 'pa-003',
    action_type: 'client_feedback_received',
    resource_id: 'proc-890',
    decision: 'Client rejected Minotti Armchair',
    reasoning: 'Client feedback: "Too modern, prefer traditional". Analysed preferences and suggested George Smith as alternative.',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    can_undo: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    project: 'Chelsea Penthouse',
    product: 'Minotti Powell Armchair',
  },
  {
    id: 'pa-004',
    action_type: 'quote_followup_sent',
    resource_id: 'proc-old-001',
    decision: 'Sent follow-up to Porta Romana',
    reasoning: 'Quote pending 5 days. Supplier responded within 4 hours with updated pricing.',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    can_undo: false,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    supplier: 'Porta Romana',
    project: 'Chelsea Penthouse',
    product: 'Lighting fixtures',
    days_waiting: 5,
  },
];

// Mock Daily Brief with Procurement Context
export const mockDailyBriefWithProcurement: DailyBrief = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  content: `Good morning Sarah. Mrs. Hartley reviewed the Chelsea Penthouse procurement last night and approved 30 of 40 items. However, she's asked for alternatives to the Minotti armchair and Christopher Guy mirror - her feedback suggests she prefers a more traditional English style.

Two items need your attention before creating purchase orders: Carrara & Co hasn't responded to the marble quote in 8 days (I've sent a follow-up), and the Devol kitchen tap is now showing as out of stock. I've found 3 alternatives in your library - the Samuel Heath mixer has similar specs and is in stock with a 1-week lead time.

On the Hampstead project, Havwoods hasn't responded to the flooring quote in 5 days, but this isn't on the critical path so there's no urgency. Everything else is tracking well across your active projects.`,
  generated_at: new Date().toISOString(),
  items: [
    {
      type: 'decision',
      priority: 'high',
      content: 'Find alternative for Minotti armchair (client rejected)',
      actionable: true,
      completed: false,
      project_id: 'proj-chelsea-001',
      related_entity: 'Mrs. Hartley',
    },
    {
      type: 'task',
      priority: 'high',
      content: 'Review Devol tap alternatives (out of stock)',
      actionable: true,
      completed: false,
      project_id: 'proj-chelsea-001',
      related_entity: 'Devol Kitchens',
    },
    {
      type: 'update',
      priority: 'medium',
      content: 'Marble quote follow-up sent to Carrara & Co',
      actionable: false,
      completed: true,
      project_id: 'proj-chelsea-001',
      related_entity: 'Carrara & Co',
    },
    {
      type: 'reminder',
      priority: 'low',
      content: 'Havwoods flooring quote pending (5 days)',
      actionable: true,
      completed: false,
      project_id: 'proj-hampstead-001',
      related_entity: 'Havwoods',
    },
  ],
  user_actions: [],
  created_at: new Date().toISOString(),
};
