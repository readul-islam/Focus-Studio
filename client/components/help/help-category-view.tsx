'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
type HelpCategory = { slug: string; name: string; description: string; icon: string };
type HelpArticle = { slug: string; title: string; description: string; readTime: number };

type Props = {
  category: HelpCategory;
  articles: HelpArticle[];
  categorySlug: string;
  otherCategories: HelpCategory[];
  icon?: React.ReactNode;
};

export function HelpCategoryView({
  category,
  articles,
  categorySlug,
  otherCategories,
  icon,
}: Props) {
  const t = useTranslations('helpCategoryPage');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          {icon}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${categorySlug}/${article.slug}`}
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h2>
            <p className="text-gray-600 mb-3">{article.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {t('minRead', { minutes: article.readTime })}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 pt-12 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('otherCategories')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/help/${cat.slug}`}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-900 transition-all"
            >
              <span className="text-sm font-medium text-gray-900">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
