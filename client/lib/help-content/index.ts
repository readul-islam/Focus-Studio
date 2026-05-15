import { HelpArticle, HELP_CATEGORIES } from './types';
import { gettingStartedArticles } from './articles/getting-started';
import { homeDashboardArticles } from './articles/home-dashboard';
import { projectsArticles } from './articles/projects';
import { crmArticles } from './articles/crm';
import { financeArticles } from './articles/finance';
import { libraryArticles } from './articles/library';
import { aiToolsArticles } from './articles/ai-tools';
import { teamArticles } from './articles/team';
import { reportsArticles } from './articles/reports';
import { settingsUserArticles } from './articles/settings-user';
import { settingsStudioArticles } from './articles/settings-studio';

// Combine all articles
export const ALL_ARTICLES: HelpArticle[] = [
  ...gettingStartedArticles,
  ...homeDashboardArticles,
  ...projectsArticles,
  ...crmArticles,
  ...financeArticles,
  ...libraryArticles,
  ...aiToolsArticles,
  ...teamArticles,
  ...reportsArticles,
  ...settingsUserArticles,
  ...settingsStudioArticles,
];

// Get articles by category
export const getArticlesByCategory = (categorySlug: string): HelpArticle[] => {
  return ALL_ARTICLES.filter(article => article.category === categorySlug);
};

// Get single article by slug
export const getArticleBySlug = (categorySlug: string, articleSlug: string): HelpArticle | undefined => {
  return ALL_ARTICLES.find(
    article => article.category === categorySlug && article.slug === articleSlug
  );
};

// Get category by slug
export const getCategoryBySlug = (slug: string) => {
  return HELP_CATEGORIES.find(cat => cat.slug === slug);
};

// Search articles
export const searchArticles = (query: string): HelpArticle[] => {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();

  return ALL_ARTICLES.filter(article => {
    const titleMatch = article.title.toLowerCase().includes(lowerQuery);
    const descMatch = article.description.toLowerCase().includes(lowerQuery);
    const contentMatch = article.content.toLowerCase().includes(lowerQuery);

    return titleMatch || descMatch || contentMatch;
  }).slice(0, 10); // Limit to 10 results
};

// Get popular articles (for homepage)
export const getPopularArticles = (): HelpArticle[] => {
  // Return curated list of most important articles
  const popularSlugs = [
    'welcome-to-techstyles',
    'creating-first-project',
    'ai-clipper-overview',
    'creating-invoice',
    'project-tasks',
    'pipeline',
  ];

  return ALL_ARTICLES.filter(article => popularSlugs.includes(article.slug));
};

// Get related articles
export const getRelatedArticles = (article: HelpArticle): HelpArticle[] => {
  if (!article.related || article.related.length === 0) return [];

  return ALL_ARTICLES.filter(a =>
    article.related?.includes(a.slug)
  ).slice(0, 3);
};

// Get article count by category
export const getArticleCountByCategory = (categorySlug: string): number => {
  return getArticlesByCategory(categorySlug).length;
};

// Export categories for easy access
export { HELP_CATEGORIES };
