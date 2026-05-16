'use server'

import type { DailyBrief, ApiResponse, ProcurementContext, BriefItem } from '@/lib/ai/types';
import { AI_CONFIG } from '@/lib/ai/config';
import { simulateAPIDelay } from '@/lib/ai/mock-data';
import { cookies } from 'next/headers';

// Check if we should use mock data
const useMockData = process.env.NEXT_PUBLIC_AI_USE_MOCK === 'true';

// Get the base URL for API calls
function getBaseUrl() {
  // In production on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Local development
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Build a dynamic brief from real user context data
 * This is used when mock mode is enabled but with real dashboard data
 */
function buildDynamicBrief(userContext?: {
  name?: string;
  overdueTasks?: number;
  todayMeetings?: Array<{ summary: string; time: string }>;
  projects?: Array<{ name: string; progress: number }>;
  pendingTasks?: number;
  timeTrackedThisWeek?: number;
  procurement?: ProcurementContext;
}): { content: string; items: BriefItem[] } {
  const name = userContext?.name || 'there';
  const overdueCount = userContext?.overdueTasks || 0;
  const meetings = userContext?.todayMeetings || [];
  const projects = userContext?.projects || [];
  const pendingTasks = userContext?.pendingTasks || 0;
  const procurement = userContext?.procurement;

  const items: BriefItem[] = [];
  const contentParts: string[] = [];

  // Opening greeting
  contentParts.push(`Good morning ${name}.`);

  // Meetings summary
  if (meetings.length > 0) {
    if (meetings.length === 1) {
      contentParts.push(`You have 1 meeting today: ${meetings[0].summary}.`);
    } else {
      contentParts.push(`You have ${meetings.length} meetings today, starting with ${meetings[0].summary}.`);
    }
  } else {
    contentParts.push(`Your calendar is clear today - a perfect opportunity for focused work.`);
  }

  // Overdue tasks
  if (overdueCount > 0) {
    contentParts.push(`There ${overdueCount === 1 ? 'is' : 'are'} ${overdueCount} overdue task${overdueCount === 1 ? '' : 's'} that ${overdueCount === 1 ? 'needs' : 'need'} your attention.`);
    items.push({
      type: 'task',
      priority: 'high',
      content: `Review ${overdueCount} overdue task${overdueCount === 1 ? '' : 's'}`,
      actionable: true,
      completed: false,
    });
  }

  // Projects progress
  if (projects.length > 0) {
    const activeProjects = projects.filter(p => p.progress < 100);
    if (activeProjects.length > 0) {
      const topProject = activeProjects[0];
      contentParts.push(`${topProject.name} is at ${topProject.progress}% completion.`);
    }
  }

  // Procurement insights (if available)
  if (procurement) {
    const stuckCount = procurement.stuck_quotes?.length || 0;
    const oosCount = procurement.out_of_stock?.length || 0;
    const rejCount = procurement.client_rejections?.length || 0;

    if (stuckCount > 0) {
      contentParts.push(`${stuckCount} quote${stuckCount === 1 ? ' is' : 's are'} awaiting supplier response.`);
      items.push({
        type: 'task',
        priority: stuckCount > 2 ? 'high' : 'medium',
        content: `Follow up on ${stuckCount} pending quote${stuckCount === 1 ? '' : 's'}`,
        actionable: true,
        completed: false,
      });
    }

    if (oosCount > 0) {
      contentParts.push(`${oosCount} item${oosCount === 1 ? ' is' : 's are'} now out of stock and ${oosCount === 1 ? 'needs' : 'need'} alternatives.`);
      items.push({
        type: 'decision',
        priority: 'high',
        content: `Review alternatives for ${oosCount} out of stock item${oosCount === 1 ? '' : 's'}`,
        actionable: true,
        completed: false,
      });
    }

    if (rejCount > 0) {
      contentParts.push(`${rejCount} item${rejCount === 1 ? ' was' : 's were'} rejected by clients and ${rejCount === 1 ? 'requires' : 'require'} replacement options.`);
      items.push({
        type: 'decision',
        priority: 'medium',
        content: `Find replacements for ${rejCount} rejected item${rejCount === 1 ? '' : 's'}`,
        actionable: true,
        completed: false,
      });
    }
  }

  // Closing
  if (items.length === 0) {
    contentParts.push(`Everything is running smoothly across your projects. A great day to make progress on your priorities.`);
  } else {
    contentParts.push(`I've highlighted the key items below to help you prioritise your day.`);
  }

  return {
    content: contentParts.join(' '),
    items,
  };
}

/**
 * Generate a new daily brief for the current user
 * Now includes procurement context (stuck quotes, out of stock, client rejections)
 */
export async function generateDailyBrief(userContext?: {
  name?: string;
  overdueTasks?: number;
  todayMeetings?: Array<{ summary: string; time: string }>;
  projects?: Array<{ name: string; progress: number }>;
  pendingTasks?: number;
  timeTrackedThisWeek?: number;
  procurement?: ProcurementContext;
}): Promise<ApiResponse<DailyBrief>> {
  // Development mode - build dynamic brief from real user data
  if (useMockData) {
    await simulateAPIDelay(null, AI_CONFIG.MOCK_DELAYS.GENERATE_BRIEF);

    // Generate a simple random ID (server-safe)
    const randomId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Build dynamic brief content from actual user context
    const { content, items } = buildDynamicBrief(userContext);

    return {
      success: true,
      data: {
        id: randomId,
        user_id: 'current-user',
        content,
        generated_at: new Date().toISOString(),
        items,
        user_actions: [],
        created_at: new Date().toISOString(),
      },
      message: 'Brief generated successfully'
    };
  }

  // Production mode - call our Next.js API route which calls Claude
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/ai/brief`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: userContext || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate brief');
    }

    const data = await response.json();

    return {
      success: true,
      data: data.brief,
      message: 'Brief generated successfully'
    };
  } catch (error: any) {
    console.error('Error generating daily brief:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate brief'
    };
  }
}

/**
 * Get the latest daily brief for the current user
 */
export async function getLatestBrief(): Promise<ApiResponse<DailyBrief>> {
  // Development mode - use mock data
  if (useMockData) {
    await simulateAPIDelay(null, AI_CONFIG.MOCK_DELAYS.GET_BRIEF);
    return {
      success: true,
      data: mockDailyBrief
    };
  }

  // Production mode - for now, generate a fresh brief
  // In a full implementation, this would fetch from database
  try {
    // We'll generate a new brief since we don't have persistence yet
    const result = await generateDailyBrief();
    return result;
  } catch (error: any) {
    console.error('Error fetching latest brief:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch brief'
    };
  }
}

/**
 * Track user actions on a brief item (for learning)
 */
export async function trackBriefAction(
  briefId: string,
  action: 'completed' | 'ignored' | 'snoozed',
  itemId: string,
  timeSpentSeconds?: number
): Promise<ApiResponse<void>> {
  // Development mode - just log and succeed
  if (useMockData) {
    await simulateAPIDelay(null, AI_CONFIG.MOCK_DELAYS.TRACK_ACTION);
    return {
      success: true,
      message: 'Action tracked successfully (mock data)'
    };
  }

  // Production mode - would send to backend for learning
  return {
    success: true,
    message: 'Action tracked successfully'
  };
}
