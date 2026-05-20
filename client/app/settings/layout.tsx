'use client';

import { type ReactNode } from 'react';
import SettingsSidebar from '@/components/settings/sidebar';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-var(--topbar-height,3.5rem))] bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-[240px,1fr] gap-4 lg:gap-8">
          <aside className="lg:rounded-lg lg:border lg:border-border lg:bg-card">
            <SettingsSidebar />
          </aside>
          <main className="space-y-6 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
