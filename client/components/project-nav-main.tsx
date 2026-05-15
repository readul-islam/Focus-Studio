'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type TabKey = 'all' | 'active' | 'completed' | 'archived';

interface ProjectNavMainProps {
  activeTab?: TabKey;
  counts?: Partial<Record<TabKey, number>>;
  onChange?: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All Projects' },
  { key: 'archived', label: 'Archived' },
];

export function ProjectNavMain({ activeTab = 'all', counts = { active: 3 }, onChange }: ProjectNavMainProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-1">
      <div className="flex scrollbar scrollbar-thin items-center gap-2 overflow-x-auto">
        {tabs.map(t => {
          const isActive = activeTab === t.key;
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              onClick={() => onChange?.(t.key)}
              className="relative inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs sm:text-sm hover:bg-stone-50 transition-colors"
            >
              {/* Animated active background */}
              {isActive && (
                <motion.span
                  layoutId="project-nav-main-active"
                  className="absolute inset-0 bg-stone-100 rounded-lg"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              {/* Content */}
              <span
                className={cn(
                  'relative z-10 transition-colors duration-150',
                  isActive ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
                )}
              >
                {t.label}
              </span>
              {typeof count === 'number' && (
                <span className="relative z-10 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-medium text-white bg-clay-500">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
