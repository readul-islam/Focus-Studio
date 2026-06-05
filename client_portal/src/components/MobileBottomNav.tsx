import { Link, useLocation } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { menuItems } from '@/lib/menuItems';
import { useTranslations } from 'next-intl';

export function MobileBottomNav() {
  const location = useLocation();
  const t = useTranslations('nav');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <nav className="flex items-center justify-around h-16 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.basePath);

          return (
            <Link
              key={item.labelKey}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 min-w-[60px]',
                isActive
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className={cn('text-xs font-medium', isActive && 'font-semibold')}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
