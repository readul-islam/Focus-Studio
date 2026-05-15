/**
 * AI Feature Configuration
 *
 * Controls whether to use mock data or real backend APIs.
 * Set USE_MOCK_DATA to false once backend endpoints are implemented.
 */

export const AI_CONFIG = {
  // Development mode - uses mock data instead of backend APIs
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_AI_USE_MOCK === 'true',

  // API endpoints (only used when USE_MOCK_DATA is false)
  ENDPOINTS: {
    // Daily Brief
    DAILY_BRIEF_GENERATE: '/api/ai/daily-brief/generate',
    DAILY_BRIEF_LATEST: '/api/ai/daily-brief/latest',
    DAILY_BRIEF_TRACK_ACTION: '/api/ai/daily-brief/track-action',
    // Magical Inbox
    INBOX_EMAILS: '/api/ai/inbox/emails',
    INBOX_PROCESS: '/api/ai/inbox/process',
    INBOX_SYNC: '/api/ai/inbox/sync',
    // Procurement
    PROCUREMENT_CHECK: '/api/ai/procurement/check',
    PROCUREMENT_FOLLOWUP: '/api/ai/procurement/followup',
  },

  // Mock data delays (milliseconds) - simulates network latency
  MOCK_DELAYS: {
    GENERATE_BRIEF: 1500, // Slower for generate (simulates Claude API)
    GET_BRIEF: 800,       // Faster for fetch
    TRACK_ACTION: 500,    // Very fast for tracking
  },
} as const;

/**
 * Helper to check if we're in mock mode
 */
export function useMockData(): boolean {
  return AI_CONFIG.USE_MOCK_DATA;
}
