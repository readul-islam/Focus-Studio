'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Zap, LayoutGrid, ContactRound, Receipt, Library, BrainCircuit, UsersRound, BarChart3, SlidersHorizontal, ArrowRight, LayoutDashboard } from 'lucide-react';
import { HELP_CATEGORIES, searchArticles, getArticleCountByCategory, getPopularArticles } from '@/lib/help-content';
import { useTranslations } from 'next-intl';

const ICON_MAP: Record<string, typeof Search> = {
  Rocket: Zap,
  Home: LayoutDashboard,
  Folder: LayoutGrid,
  Users: ContactRound,
  DollarSign: Receipt,
  BookOpen: Library,
  Sparkles: BrainCircuit,
  Users2: UsersRound,
  BarChart: BarChart3,
  Settings: SlidersHorizontal,
};

export default function HelpCentrePage() {
  const t = useTranslations('helpPage');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchArticles>>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = searchArticles(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const popularArticles = getPopularArticles();

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{t('heroTitle')}</h1>
        <p className="text-base text-gray-500">{t('heroSubtitle')}</p>

        <div className="max-w-xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white placeholder-gray-400"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-10">
              {searchResults.map((article) => (
                <Link
                  key={article.slug}
                  href={`/help/${article.category}/${article.slug}`}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <div className="font-medium text-gray-900">{article.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-1">{article.description}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('browseByCategory')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HELP_CATEGORIES.map((category) => {
            const Icon = ICON_MAP[category.icon];
            const articleCount = getArticleCountByCategory(category.slug);

            return (
              <Link
                key={category.slug}
                href={`/help/${category.slug}`}
                className="group block p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    {Icon && <Icon className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {t('articlesCount', { count: articleCount })}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-gray-700">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{category.description}</p>
                <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {t('viewArticles')}
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('popularArticles')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/help/${article.category}/${article.slug}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all"
            >
              <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                {t('minRead', { minutes: article.readTime })}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
