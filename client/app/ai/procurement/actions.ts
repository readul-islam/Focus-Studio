'use server';

import { AI_CONFIG } from '@/lib/ai/config';
import {
  mockStuckQuotes,
  mockOutOfStock,
  mockClientRejections,
  mockProcurementInsights,
  mockProcurementContext,
  mockSupplierPerformance,
  simulateAPIDelay,
} from '@/lib/ai/mock-data';
import type {
  StuckQuote,
  OutOfStockItem,
  ClientRejection,
  ProcurementInsight,
  ProcurementContext,
  SupplierPerformance,
  FollowUpEmail,
} from '@/lib/ai/types';

// Get all stuck quotes (quotes with no response > minDays)
export async function getStuckQuotes(options?: {
  projectId?: string;
  minDays?: number;
  criticalOnly?: boolean;
}): Promise<{ success: boolean; data?: StuckQuote[]; error?: string }> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      let quotes = [...mockStuckQuotes];
      const minDays = options?.minDays ?? 3;

      if (options?.projectId) {
        quotes = quotes.filter(q => q.project_id === options.projectId);
      }

      quotes = quotes.filter(q => q.days_waiting >= minDays);

      if (options?.criticalOnly) {
        quotes = quotes.filter(q => q.is_critical_path);
      }

      // Sort: critical path first, then by days waiting
      quotes.sort((a, b) => {
        if (a.is_critical_path !== b.is_critical_path) {
          return a.is_critical_path ? -1 : 1;
        }
        return b.days_waiting - a.days_waiting;
      });

      await simulateAPIDelay(null, 200);
      return { success: true, data: quotes };
    }

    // Production: Call API route
    const params = new URLSearchParams();
    if (options?.projectId) params.set('project_id', options.projectId);
    if (options?.minDays) params.set('min_days', String(options.minDays));
    if (options?.criticalOnly) params.set('critical_only', 'true');

    const response = await fetch(`/api/ai/procurement/stuck-quotes?${params}`);
    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data.quotes };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error('Error fetching stuck quotes:', error);
    return { success: false, error: 'Failed to fetch stuck quotes' };
  }
}

// Get out of stock items
export async function getOutOfStockItems(projectId?: string): Promise<{
  success: boolean;
  data?: OutOfStockItem[];
  error?: string;
}> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      let items = [...mockOutOfStock];

      if (projectId) {
        items = items.filter(i => i.project_id === projectId);
      }

      await simulateAPIDelay(null, 150);
      return { success: true, data: items };
    }

    // TODO: Implement API call
    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error fetching out of stock items:', error);
    return { success: false, error: 'Failed to fetch out of stock items' };
  }
}

// Get client rejections
export async function getClientRejections(projectId?: string): Promise<{
  success: boolean;
  data?: ClientRejection[];
  error?: string;
}> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      let rejections = [...mockClientRejections];

      if (projectId) {
        rejections = rejections.filter(r => r.project_id === projectId);
      }

      await simulateAPIDelay(null, 150);
      return { success: true, data: rejections };
    }

    // TODO: Implement API call
    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error fetching client rejections:', error);
    return { success: false, error: 'Failed to fetch client rejections' };
  }
}

// Get all procurement insights for a project
export async function getProcurementInsights(projectId?: string): Promise<{
  success: boolean;
  data?: ProcurementInsight[];
  error?: string;
}> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      let insights = [...mockProcurementInsights];

      // In mock mode, show all insights regardless of projectId
      // (real project IDs won't match mock data IDs)
      // In production, filter by projectId

      // Sort by severity (urgent first)
      const severityOrder = { urgent: 0, warning: 1, info: 2 };
      insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      await simulateAPIDelay(null, 200);
      return { success: true, data: insights };
    }

    // TODO: Implement API call
    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error fetching procurement insights:', error);
    return { success: false, error: 'Failed to fetch procurement insights' };
  }
}

// Get full procurement context (for Daily Brief)
export async function getProcurementContext(): Promise<{
  success: boolean;
  data?: ProcurementContext;
  error?: string;
}> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      await simulateAPIDelay(null, 300);
      return { success: true, data: mockProcurementContext };
    }

    // Aggregate from multiple sources
    const [quotesResult, stockResult, rejectionsResult] = await Promise.all([
      getStuckQuotes(),
      getOutOfStockItems(),
      getClientRejections(),
    ]);

    const context: ProcurementContext = {
      stuck_quotes: quotesResult.data || [],
      out_of_stock: stockResult.data || [],
      client_rejections: rejectionsResult.data || [],
      pending_approvals: 0, // TODO: Get from procurement data
      quotes_sent_today: 0, // TODO: Get from activity log
      total_active_procurements: 0, // TODO: Get from procurement data
    };

    return { success: true, data: context };
  } catch (error) {
    console.error('Error fetching procurement context:', error);
    return { success: false, error: 'Failed to fetch procurement context' };
  }
}

// Generate a follow-up email for a stuck quote
export async function generateFollowUpEmail(
  quoteId: string,
  urgency: 'gentle' | 'reminder' | 'urgent' = 'gentle'
): Promise<{
  success: boolean;
  data?: { email: FollowUpEmail; quote: StuckQuote };
  error?: string;
}> {
  try {
    const response = await fetch('/api/ai/procurement/stuck-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote_id: quoteId, urgency }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error('Error generating follow-up email:', error);
    return { success: false, error: 'Failed to generate follow-up email' };
  }
}

// Send a follow-up email
export async function sendFollowUpEmail(
  email: FollowUpEmail
): Promise<{ success: boolean; error?: string }> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      // Simulate sending
      await simulateAPIDelay(null, 1000);
      return { success: true };
    }

    // TODO: Implement actual email sending via backend
    // This would call the existing email system
    return { success: false, error: 'Email sending not implemented' };
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    return { success: false, error: 'Failed to send follow-up email' };
  }
}

// Get supplier performance data
export async function getSupplierPerformance(supplierId?: string): Promise<{
  success: boolean;
  data?: SupplierPerformance[];
  error?: string;
}> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      let performance = [...mockSupplierPerformance];

      if (supplierId) {
        performance = performance.filter(p => p.supplier_id === supplierId);
      }

      // Sort by reliability score (highest first)
      performance.sort((a, b) => b.reliability_score - a.reliability_score);

      await simulateAPIDelay(null, 200);
      return { success: true, data: performance };
    }

    // TODO: Implement API call
    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error fetching supplier performance:', error);
    return { success: false, error: 'Failed to fetch supplier performance' };
  }
}

// Log a procurement action (for AI Activity feed)
export async function logProcurementAction(action: {
  action_type: string;
  resource_id: string;
  decision: string;
  reasoning?: string;
  supplier?: string;
  project?: string;
  product?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (AI_CONFIG.USE_MOCK_DATA) {
      return { success: true };
    }

    // TODO: Implement API call to log action
    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error logging procurement action:', error);
    return { success: false, error: 'Failed to log action' };
  }
}
