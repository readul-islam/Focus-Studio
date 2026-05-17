'use server'

import type { EmailAnalysis, ApiResponse } from '@/lib/ai/types';
import { AI_CONFIG } from '@/lib/ai/config';
import { postData, fetchData } from '@/lib/Api';

export interface EmailWithAnalysis {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
  analysis?: {
    category: 'action_required' | 'procurement' | 'fyi';
    project?: string;
    summary: string;
    suggestedAction?: string;
    entities?: {
      suppliers?: string[];
      amounts?: Array<{ value: number; currency: string }>;
      dates?: string[];
      items?: string[];
      people?: string[];
    };
  };
}

export interface InboxStats {
  total: number;
  actionRequired: number;
  procurement: number;
  fyi: number;
  unread: number;
}

const useMockData = process.env.NEXT_PUBLIC_AI_USE_MOCK === 'true';

const mockInboxEmails: EmailWithAnalysis[] = [
  {
    id: 'inbox-001',
    from: 'quotes@devol.co.uk',
    fromName: 'Devol Kitchens',
    subject: 'Quote for Hampstead Kitchen – Requires Approval',
    snippet: 'Hi Sarah, please find attached the revised quote for the Hampstead project kitchen cabinets and worktop. The total comes to £18,500 and we can hold this pricing until end of week if you are able to confirm.',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    hasAttachment: true,
    analysis: {
      category: 'action_required',
      project: 'Hampstead Renovation',
      summary: 'Devol Kitchens sent the revised kitchen quote for £18,500. Requires approval by end of week to hold pricing and maintain the delivery schedule.',
      suggestedAction: 'Review quote against budget and approve. Coordinate delivery timing with Marcus.',
      entities: {
        suppliers: ['Devol Kitchens'],
        amounts: [{ value: 18500, currency: 'GBP' }],
        items: ['Kitchen cabinets', 'Worktop', 'Handles'],
        people: ['Marcus Thompson'],
      },
    },
  },
  {
    id: 'inbox-002',
    from: 'orders@carraramarble.co.uk',
    fromName: 'Carrara & Co',
    subject: 'Re: Marble Quote – Chelsea Penthouse',
    snippet: 'Thank you for your patience. We are pleased to confirm availability of the Carrara Marble Slabs for the Chelsea Penthouse Master Bathroom. Please see updated pricing attached.',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    hasAttachment: true,
    analysis: {
      category: 'procurement',
      project: 'Chelsea Penthouse',
      summary: 'Carrara & Co responded to the 8-day overdue marble quote. Confirming availability and updated pricing for the Master Bathroom install.',
      suggestedAction: 'Compare pricing against original estimate. Accept if within 5% variance.',
      entities: {
        suppliers: ['Carrara & Co'],
        amounts: [{ value: 12500, currency: 'GBP' }],
        items: ['Carrara Marble Slabs'],
      },
    },
  },
  {
    id: 'inbox-003',
    from: 'trade@havwoods.co.uk',
    fromName: 'Havwoods',
    subject: 'Flooring Quote – Hampstead Living Room',
    snippet: 'Dear Sarah, here is the pricing for the bespoke oak flooring for the Hampstead living room. We have availability for your preferred installation date and can dispatch within 10 working days of order confirmation.',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    hasAttachment: true,
    analysis: {
      category: 'procurement',
      project: 'Hampstead Renovation',
      summary: 'Havwoods responded to the pending flooring quote with pricing and confirmed availability for your preferred installation date.',
      suggestedAction: 'Review specification details and confirm order once kitchen quote is approved.',
      entities: {
        suppliers: ['Havwoods'],
        amounts: [{ value: 8900, currency: 'GBP' }],
        items: ['Bespoke Oak Flooring'],
      },
    },
  },
  {
    id: 'inbox-004',
    from: 'hartley@email.com',
    fromName: 'Mrs. Hartley',
    subject: 'Drawing Room Feedback – Please Review',
    snippet: 'Sarah, I had another think about the armchair selection. The Minotti is lovely but feels a bit too modern for the room. Could we look at something more traditional? The mirror has the same issue – the frame is too ornate for the space.',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    hasAttachment: false,
    analysis: {
      category: 'action_required',
      project: 'Chelsea Penthouse',
      summary: 'Mrs. Hartley rejected both the Minotti armchair and Christopher Guy mirror. Prefers a more traditional, understated style for the Drawing Room.',
      suggestedAction: 'Pull traditional alternatives from library. George Smith and Kingcome are strong matches based on her previous approvals.',
      entities: {
        people: ['Mrs. Hartley'],
        items: ['Minotti Powell Armchair', 'Christopher Guy Mirror'],
      },
    },
  },
  {
    id: 'inbox-005',
    from: 'deliveries@portaromana.com',
    fromName: 'Porta Romana',
    subject: 'Delivery Confirmation – Lighting Fixtures',
    snippet: 'Your order of lighting fixtures for Chelsea Penthouse is confirmed for delivery on Friday 7 February between 9am–12pm. Please ensure site access is available and a representative is present to sign.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    hasAttachment: false,
    analysis: {
      category: 'fyi',
      project: 'Chelsea Penthouse',
      summary: 'Porta Romana confirmed delivery of lighting fixtures for Friday 7 Feb, 9am–12pm. A site representative needs to be available to sign.',
      entities: {
        suppliers: ['Porta Romana'],
        items: ['Lighting fixtures'],
      },
    },
  },
  {
    id: 'inbox-006',
    from: 'colt@focuspilot.io',
    fromName: 'Marcus Thompson',
    subject: 'Site Update – Hampstead',
    snippet: 'Hi Sarah, just a quick update — the electricians are finishing first fix today. We are on track for plastering to start next Monday. The kitchen units delivery slot is still open so let me know once you have confirmed with Devol.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    hasAttachment: false,
    analysis: {
      category: 'fyi',
      project: 'Hampstead Renovation',
      summary: 'Marcus confirms electricians finishing first fix today. Plastering starts Monday. Kitchen delivery slot still open — needs Devol confirmation.',
      suggestedAction: 'Confirm kitchen delivery timing with Devol once quote is approved.',
      entities: {
        people: ['Marcus Thompson'],
        items: ['Electrical first fix', 'Kitchen units'],
      },
    },
  },
];

export async function getInboxEmails(
  category?: 'action_required' | 'procurement' | 'fyi' | 'all'
): Promise<ApiResponse<{ emails: EmailWithAnalysis[]; stats: InboxStats }>> {
  // Mock mode – return AI-categorised sample emails
  if (useMockData) {
    const filtered = category && category !== 'all'
      ? mockInboxEmails.filter(e => e.analysis?.category === category)
      : mockInboxEmails;

    const stats: InboxStats = {
      total: mockInboxEmails.length,
      actionRequired: mockInboxEmails.filter(e => e.analysis?.category === 'action_required').length,
      procurement: mockInboxEmails.filter(e => e.analysis?.category === 'procurement').length,
      fyi: mockInboxEmails.filter(e => e.analysis?.category === 'fyi').length,
      unread: mockInboxEmails.filter(e => !e.isRead).length,
    };

    return {
      success: true,
      data: { emails: filtered, stats },
    };
  }

  // Production mode – fetch from backend API
  const emptyStats: InboxStats = {
    total: 0,
    actionRequired: 0,
    procurement: 0,
    fyi: 0,
    unread: 0,
  };

  try {
    const endpoint = category && category !== 'all'
      ? `${AI_CONFIG.ENDPOINTS.INBOX_EMAILS}?category=${category}`
      : AI_CONFIG.ENDPOINTS.INBOX_EMAILS;
    const response = await fetchData(endpoint);

    if (response && response.emails && response.emails.length > 0) {
      return {
        success: true,
        data: response,
      };
    }
  } catch (error: any) {
  }

  return {
    success: true,
    data: { emails: [], stats: emptyStats },
    message: 'Connect your Gmail account to see emails',
  };
}

/**
 * Process a single email with AI analysis
 * Note: Requires Gmail integration
 */
export async function processEmail(emailId: string): Promise<ApiResponse<EmailAnalysis>> {
  try {
    const response = await postData({
      url: AI_CONFIG.ENDPOINTS.INBOX_PROCESS,
      data: { email_id: emailId },
    });
    return {
      success: true,
      data: response.analysis,
      message: 'Email processed successfully',
    };
  } catch (error: any) {
    console.error('Error processing email:', error);
    return {
      success: false,
      error: 'Gmail integration required. Please connect your Gmail account.',
    };
  }
}

/**
 * Mark email as read
 * Note: Requires Gmail integration
 */
export async function markEmailRead(emailId: string): Promise<ApiResponse<void>> {
  try {
    await postData({
      url: `${AI_CONFIG.ENDPOINTS.INBOX_EMAILS}/${emailId}/read`,
      data: {},
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Gmail integration required' };
  }
}

/**
 * Sync emails from Gmail
 * Note: Requires Gmail integration to be set up by backend team
 */
export async function syncEmails(): Promise<ApiResponse<{ synced: number }>> {
  if (useMockData) {
    return {
      success: true,
      data: { synced: mockInboxEmails.length },
      message: `Synced ${mockInboxEmails.length} emails`,
    };
  }

  try {
    const response = await postData({
      url: AI_CONFIG.ENDPOINTS.INBOX_SYNC,
      data: {},
    });
    return {
      success: true,
      data: response,
      message: `Synced ${response.synced} new emails`,
    };
  } catch (error: any) {
    console.error('Error syncing emails:', error);
    return {
      success: false,
      error: 'Gmail integration required. Please connect your Gmail account to sync emails.',
    };
  }
}
