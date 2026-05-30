import React from 'react';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getCategoryBySlug, getRelatedArticles, ALL_ARTICLES } from '@/lib/help-content';
import { HelpArticleView } from '@/components/help/help-article-view';

export function generateStaticParams() {
  return ALL_ARTICLES.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key++}`} className="list-disc list-inside space-y-2 my-4 ml-4">
          {currentList.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>,
      );
      currentList = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('# ')) {
      flushList();
    } else if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${key++}`} className="text-2xl font-semibold text-gray-900 mt-8 mb-3">
          {trimmedLine.slice(3)}
        </h2>,
      );
    } else if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${key++}`} className="text-xl font-semibold text-gray-900 mt-6 mb-2">
          {trimmedLine.slice(4)}
        </h3>,
      );
    } else if (trimmedLine.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${key++}`} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          {trimmedLine.slice(5)}
        </h4>,
      );
    } else if (trimmedLine.startsWith('- ')) {
      currentList.push(trimmedLine.slice(2));
    } else if (trimmedLine.length > 0) {
      flushList();
      elements.push(
        <p key={`p-${key++}`} className="text-gray-700 leading-relaxed my-4">
          {formatInline(trimmedLine)}
        </p>,
      );
    } else {
      flushList();
    }
  });

  flushList();
  return elements;
}

export default function ArticlePage({ params }: { params: { category: string; slug: string } }) {
  const article = getArticleBySlug(params.category, params.slug);
  const category = getCategoryBySlug(params.category);

  if (!article || !category) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article);

  return (
    <HelpArticleView
      article={article}
      category={category}
      categorySlug={params.category}
      relatedArticles={relatedArticles}
    >
      {renderMarkdown(article.content)}
    </HelpArticleView>
  );
}
