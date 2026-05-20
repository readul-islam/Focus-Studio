import type { ProductTourStepConfig } from './types';

export const MAIN_APP_TOUR_ID = 'main-app-v1';

/** Configure steps in one place — targets use `data-tour` on DOM nodes. */
export const mainAppTourSteps: ProductTourStepConfig[] = [
  {
    target: '[data-tour="nav-home"]',
    title: 'Your home base',
    description:
      'The dashboard shows your daily brief, meetings, overdue tasks, and where you left off.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-inbox"]',
    title: 'AI Inbox',
    description:
      'Triage project email and AI suggestions in one place — linked to your active projects.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-projects"]',
    title: 'Projects',
    description:
      'Every client job lives here: tasks, procurement, documents, finance, and team chat.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-crm"]',
    title: 'CRM',
    description: 'Manage contacts, pipeline, and proposals before work becomes a project.',
    placement: 'right',
  },
  {
    target: '[data-tour="top-search"]',
    title: 'Search & command palette',
    description: 'Press ⌘K (or Ctrl+K) to jump anywhere — projects, settings, tasks, and more.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-brief"]',
    title: 'Daily brief',
    description:
      'Your AI-generated summary of what needs attention today. Regenerate anytime as your day changes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-cards"]',
    title: 'At-a-glance widgets',
    description: 'Meetings, overdue tasks, recent projects, and time tracked — all in one row.',
    placement: 'top',
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Settings & help',
    description:
      'Update your profile, studio branding, integrations, and revisit this tour from Help when you need it.',
    placement: 'right',
  },
];
