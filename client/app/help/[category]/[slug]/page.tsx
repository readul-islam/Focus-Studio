import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, Calendar } from 'lucide-react';
import { getArticleBySlug, getCategoryBySlug, getRelatedArticles, ALL_ARTICLES, HELP_CATEGORIES } from '@/lib/help-content';

export function generateStaticParams() {
  return ALL_ARTICLES.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

// Render inline bold/italic formatting
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

// Simple markdown renderer (basic)
function renderMarkdown(content: string) {
  // Split into lines for processing
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
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmedLine = line.trim();

    // Headings — skip h1 (article title already rendered in header above)
    if (trimmedLine.startsWith('# ')) {
      flushList();
      // intentionally skipped — title is already in the article header
    } else if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={`h2-${key++}`} className="text-2xl font-semibold text-gray-900 mt-8 mb-3">{trimmedLine.slice(3)}</h2>);
    } else if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={`h3-${key++}`} className="text-xl font-semibold text-gray-900 mt-6 mb-2">{trimmedLine.slice(4)}</h3>);
    } else if (trimmedLine.startsWith('#### ')) {
      flushList();
      elements.push(<h4 key={`h4-${key++}`} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{trimmedLine.slice(5)}</h4>);
    }
    // List items
    else if (trimmedLine.startsWith('- ')) {
      currentList.push(trimmedLine.slice(2));
    }
    // Paragraphs
    else if (trimmedLine.length > 0) {
      flushList();
      elements.push(<p key={`p-${key++}`} className="text-gray-700 leading-relaxed my-4">{formatInline(trimmedLine)}</p>);
    }
    // Empty line
    else {
      flushList();
    }
  });

  flushList(); // Flush any remaining list items

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
    <div className="max-w-4xl mx-auto">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.readTime} min read
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Updated {new Date(article.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-12">
        {renderMarkdown(article.content)}
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Articles</h2>
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
