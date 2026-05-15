'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type NavPillItem = {
  label: string;
  href: string;
  count?: number;
};

export type NavPillsProps = {
  items: NavPillItem[];
  activeHref: string;
  className?: string;
  /** Unique ID for this NavPills instance - required for Framer Motion layoutId */
  id: string;
};

/**
 * Shared pill nav with smooth Framer Motion transitions.
 * The active indicator slides smoothly between pills using layoutId.
 */
export function NavPills({ items, activeHref, className, id }: NavPillsProps) {
  // Find the best matching item (longest matching href)
  const bestMatch = items.reduce<NavPillItem | null>((best, item) => {
    const isMatch = activeHref === item.href || activeHref.startsWith(item.href + '/');
    if (!isMatch) return best;
    if (!best) return item;
    return item.href.length > best.href.length ? item : best;
  }, null);

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-1', className)}>
      <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Section navigation">
        {items.map(item => {
          const isActive = bestMatch?.href === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className="relative inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs sm:text-sm font-normal hover:bg-stone-50 transition-colors"
            >
              {/* Animated active background */}
              {isActive && (
                <motion.span
                  layoutId={`nav-pill-active-${id}`}
                  className="absolute inset-0 bg-stone-100 rounded-lg"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              {/* Content - z-10 to stay above the animated background */}
              <span
                className={cn(
                  'relative z-10 transition-colors duration-150',
                  isActive ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
