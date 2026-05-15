'use server';

import { simulateAPIDelay } from '@/lib/ai/mock-data';

// AI Activity types for the feed
export interface AIActivity {
  id: string;
  type: 'daily_brief' | 'email_categorized' | 'procurement_followup' | 'procurement_escalation' |
        'quote_reminder' | 'stock_change_detected' | 'client_feedback_received' | 'quote_received' | 'delivery_update';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  actionable: boolean;
  relatedProject?: string;
  relatedProjectId?: string;
  supplier?: string;
  product?: string;
  canUndo?: boolean;
  link?: string;
}

// Derive activities from procurement items (internal helper, not exported as server action)
function deriveProcurementActivities(procurementItems: any[]): AIActivity[] {
  const activities: AIActivity[] = [];
  const now = new Date();

  procurementItems.forEach((item) => {
    // Calculate days since creation/update
    const itemDate = new Date(item.created_at || item.updated_at);
    const daysSince = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

    // Stuck quotes - generate follow-up activity
    if (item.status === 'QT' && daysSince >= 3) {
      activities.push({
        id: `activity-stuck-${item.id}`,
        type: 'procurement_followup',
        title: daysSince >= 7
          ? `Urgent: Quote pending ${daysSince} days`
          : `Quote pending ${daysSince} days`,
        description: `${item.product?.name || 'Item'} from ${item.supplier?.company_name || 'supplier'} - follow-up recommended`,
        timestamp: item.updated_at || item.created_at,
        status: 'pending',
        actionable: true,
        supplier: item.supplier?.company_name,
        product: item.product?.name,
        relatedProject: item.room?.name,
        canUndo: false,
      });
    }

    // Out of stock items
    if (item.status === 'OS') {
      activities.push({
        id: `activity-oos-${item.id}`,
        type: 'stock_change_detected',
        title: `Detected: ${item.product?.name || 'Item'} out of stock`,
        description: `${item.supplier?.company_name || 'Supplier'} reports item unavailable. Consider alternatives.`,
        timestamp: item.updated_at || now.toISOString(),
        status: 'pending',
        actionable: true,
        supplier: item.supplier?.company_name,
        product: item.product?.name,
        relatedProject: item.room?.name,
        canUndo: false,
      });
    }

    // Client rejections
    if (item.client_approval === 'REJ') {
      activities.push({
        id: `activity-rej-${item.id}`,
        type: 'client_feedback_received',
        title: `Client rejected: ${item.product?.name || 'Item'}`,
        description: item.client_comment
          ? `Client feedback: "${item.client_comment}". Find alternatives.`
          : 'Client has rejected this item. Find replacement options.',
        timestamp: item.updated_at || now.toISOString(),
        status: 'pending',
        actionable: true,
        product: item.product?.name,
        relatedProject: item.room?.name,
        canUndo: false,
      });
    }

    // Recent approvals
    if (item.client_approval === 'APR') {
      const approvalDate = new Date(item.updated_at);
      const daysSinceApproval = Math.floor((now.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24));

      // Only show recent approvals (last 7 days)
      if (daysSinceApproval <= 7) {
        activities.push({
          id: `activity-apr-${item.id}`,
          type: 'quote_received',
          title: `Client approved: ${item.product?.name || 'Item'}`,
          description: `${item.product?.name || 'Item'} approved and ready for purchase order.`,
          timestamp: item.updated_at,
          status: 'completed',
          actionable: false,
          supplier: item.supplier?.company_name,
          product: item.product?.name,
          relatedProject: item.room?.name,
          canUndo: false,
        });
      }
    }
  });

  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities;
}

// Get AI activities - combines mock data with derived activities
export async function getAIActivities(options?: {
  procurementItems?: any[];
  limit?: number;
}): Promise<{ success: boolean; data?: AIActivity[]; error?: string }> {
  try {
    await simulateAPIDelay(null, 200);

    let activities: AIActivity[] = [];

    // If procurement items provided, derive activities from them
    if (options?.procurementItems && options.procurementItems.length > 0) {
      activities = deriveProcurementActivities(options.procurementItems);
    }

    // Only add daily brief activity if there are other activities
    if (activities.length > 0) {
      activities.unshift({
        id: `brief-${Date.now()}`,
        type: 'daily_brief',
        title: 'Daily Brief generated',
        description: `Your personalised morning brief is ready with ${activities.filter(a => a.status === 'pending').length} items needing attention.`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        actionable: false,
        link: '/home/dashboard',
      });

      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    // Apply limit if specified
    if (options?.limit) {
      activities = activities.slice(0, options.limit);
    }

    return { success: true, data: activities };
  } catch (error) {
    console.error('Error fetching AI activities:', error);
    return { success: false, error: 'Failed to fetch AI activities' };
  }
}
