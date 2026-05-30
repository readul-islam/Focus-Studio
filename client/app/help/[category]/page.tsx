import { notFound } from 'next/navigation';
import { getCategoryBySlug, getArticlesByCategory, HELP_CATEGORIES } from '@/lib/help-content';
import { Zap, LayoutDashboard, LayoutGrid, ContactRound, Receipt, Library, BrainCircuit, UsersRound, BarChart3, SlidersHorizontal } from 'lucide-react';
import { HelpCategoryView } from '@/components/help/help-category-view';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  const otherCategories = HELP_CATEGORIES.filter((cat) => cat.slug !== params.category);

  return (
    <HelpCategoryView
      category={category}
      articles={articles}
      categorySlug={params.category}
      otherCategories={otherCategories}
      icon={
        Icon ? (
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        ) : undefined
      }
    />
  );
}
