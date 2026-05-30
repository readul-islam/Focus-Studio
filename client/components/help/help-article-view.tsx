'use client';

import Link from 'next/link';
import { Clock, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HelpArticleScreenshots } from '@/components/help/HelpArticleScreenshots';
import { HelpArticleFeedback } from '@/components/help/HelpArticleFeedback';

type Article = {
  slug: string;
  category: string;
  title: string;
  description: string;
  content: string;
  readTime: number;
  lastUpdated: string;
  screenshots?: { src: string; alt: string }[];
};

type Category = { slug: string; name: string };

type Props = {
  article: Article;
  category: Category;
  categorySlug: string;
  relatedArticles: Article[];
  children: React.ReactNode;
};

export function HelpArticleView({
  article,
  category,
  categorySlug,
  relatedArticles,
  children,
}: Props) {
  const t = useTranslations('helpArticlePage');

  const updatedLabel = new Date(article.lastUpdated).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {t('minRead', { minutes: article.readTime })}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {t('updated', { date: updatedLabel })}
          </div>
        </div>
      </div>

      <div className="prose prose-lg max-w-none mb-12">{children}</div>

      <HelpArticleScreenshots screenshots={article.screenshots} title={article.title} />

      <HelpArticleFeedback category={categorySlug} articleSlug={article.slug} />

      {relatedArticles.length > 0 && (
        <div className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('relatedArticles')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/help/${related.category}/${related.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all"
              >
                <h3 className="font-medium text-gray-900 mb-2">{related.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{related.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
