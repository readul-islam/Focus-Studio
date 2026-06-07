import { ALL_ARTICLES, searchArticles } from '@/lib/help-content';

export type SupportArticleContext = {
  title: string;
  category: string;
  slug: string;
  excerpt: string;
};

export type SupportSuggestionKey =
  | 'suggestInvoice'
  | 'suggestStripe'
  | 'suggestProjects'
  | 'suggestPermissions'
  | 'suggestCrm'
  | 'suggestLibrary'
  | 'suggestReports'
  | 'suggestInbox'
  | 'suggestTasks'
  | 'suggestPresentations'
  | 'suggestDesign';

function excerpt(content: string, max = 400): string {
  const plain = content.replace(/[#>*_\[\]()`-]/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length <= max ? plain : `${plain.slice(0, max).trim()}…`;
}

export function buildArticleContextForMessage(message: string): SupportArticleContext[] {
  const query = message.trim();
  const results = query.length >= 2 ? searchArticles(query) : [];

  const articles =
    results.length > 0
      ? results
      : ALL_ARTICLES.filter((a) =>
          ['creating-invoice', 'welcome-to-techstyles', 'creating-first-project', 'pipeline', 'ai-clipper-overview'].includes(
            a.slug
          )
        );

  return articles.slice(0, 5).map((article) => ({
    title: article.title,
    category: article.category,
    slug: article.slug,
    excerpt: excerpt(article.content),
  }));
}

export function getPageContextLabel(pathname: string): string {
  if (!pathname) return '';
  if (pathname.startsWith('/finance')) return 'Finance';
  if (pathname.startsWith('/projects')) return 'Projects';
  if (pathname.startsWith('/crm')) return 'CRM';
  if (pathname.startsWith('/library')) return 'Library';
  if (pathname.startsWith('/reports')) return 'Reports';
  if (pathname.startsWith('/ai')) return 'AI tools';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/help')) return 'Help Centre';
  if (pathname.startsWith('/home')) return 'Dashboard';
  if (pathname.startsWith('/teams')) return 'Team';
  if (pathname.startsWith('/design')) return 'Design';
  if (pathname.startsWith('/presentations')) return 'Presentations';
  if (pathname.startsWith('/calendar')) return 'Calendar';
  return 'Focuspilot';
}

/** Context-aware quick prompts for the current route (i18n keys under supportWidget.chat). */
export function getContextSuggestionKeys(pathname: string): SupportSuggestionKey[] {
  if (pathname.startsWith('/finance')) {
    return ['suggestInvoice', 'suggestStripe', 'suggestProjects'];
  }
  if (pathname.startsWith('/projects')) {
    return ['suggestProjects', 'suggestPermissions', 'suggestInvoice'];
  }
  if (pathname.startsWith('/crm')) {
    return ['suggestCrm', 'suggestProjects', 'suggestInvoice'];
  }
  if (pathname.startsWith('/library')) {
    return ['suggestLibrary', 'suggestProjects', 'suggestDesign'];
  }
  if (pathname.startsWith('/reports')) {
    return ['suggestReports', 'suggestProjects', 'suggestInvoice'];
  }
  if (pathname.startsWith('/ai')) {
    return ['suggestInbox', 'suggestProjects', 'suggestPermissions'];
  }
  if (pathname.startsWith('/home')) {
    return ['suggestTasks', 'suggestProjects', 'suggestInbox'];
  }
  if (pathname.startsWith('/presentations')) {
    return ['suggestPresentations', 'suggestProjects', 'suggestCrm'];
  }
  if (pathname.startsWith('/design')) {
    return ['suggestDesign', 'suggestLibrary', 'suggestProjects'];
  }
  if (pathname.startsWith('/settings')) {
    return ['suggestPermissions', 'suggestStripe', 'suggestProjects'];
  }
  return ['suggestProjects', 'suggestInvoice', 'suggestPermissions', 'suggestInbox'];
}

export const SUPPORT_WIDGET_HIDDEN_PREFIXES = [
  '/onboarding',
  '/finance/stripe-connect',
  '/billing/success',
  '/billing/cancel',
  '/login',
  '/register',
  '/pricing',
];

export function shouldShowSupportWidget(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.includes('/pdf/')) return false;
  if (pathname.match(/\/presentations\/\d+\/present\/?$/)) return false;
  return !SUPPORT_WIDGET_HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
