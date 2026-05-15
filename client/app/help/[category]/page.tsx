import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock } from 'lucide-react';
import { getCategoryBySlug, getArticlesByCategory, HELP_CATEGORIES } from '@/lib/help-content';
import { Zap, LayoutDashboard, LayoutGrid, ContactRound, Receipt, Library, BrainCircuit, UsersRound, BarChart3, SlidersHorizontal } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
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

export function generateStaticParams() {
  return HELP_CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategoryBySlug(params.category);
  const articles = getArticlesByCategory(params.category);

  if (!category) {
    notFound();
  }

  const Icon = ICON_MAP[category.icon];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Category Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          {Icon && (
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${params.category}/${article.slug}`}
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
              {article.title}
            </h2>
            <p className="text-gray-600 mb-3">{article.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {article.readTime} min read
            </div>
          </Link>
        ))}
      </div>

      {/* Other Categories Sidebar */}
      <div className="mt-12 pt-12 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HELP_CATEGORIES.filter(cat => cat.slug !== params.category).map((cat) => {
            const CatIcon = ICON_MAP[cat.icon];
            return (
              <Link
                key={cat.slug}
                href={`/help/${cat.slug}`}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all"
              >
                {CatIcon && (
                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                    <CatIcon className="w-5 h-5 text-gray-900" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{cat.name}</div>
                  <div className="text-sm text-gray-600">{cat.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
