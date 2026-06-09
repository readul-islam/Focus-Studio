'use client';

import { useState } from 'react';
import useUser from '@/hooks/userUser';
import { ChatPanel } from '@/components/support/portal-support-widget';
import { ClientStudioChat } from '@/components/messages/ClientStudioChat';
import { useTranslations } from 'next-intl';
import { MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function getUserDisplayName(user: Record<string, unknown> | null | undefined) {
  if (!user) return '';
  return String(user.name || user.company_name || user.email || '').trim();
}

type Tab = 'studio' | 'ai';

export default function MessagesPage() {
  const t = useTranslations('messagesPage');
  const [tab, setTab] = useState<Tab>('studio');
  const { user, project } = useUser();
  const userName = getUserDisplayName(user as Record<string, unknown> | null);
  const projectName = project?.project_name ? String(project.project_name) : '';

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-stone-50 md:h-[calc(100dvh-4rem)]">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
        <div className="mt-4 flex gap-2">
          {(
            [
              { id: 'studio' as const, icon: MessageCircle, label: t('tabs.studio') },
              { id: 'ai' as const, icon: Sparkles, label: t('tabs.ai') },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                tab === id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden bg-white sm:my-4 sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-sm">
        {tab === 'studio' ? (
          <ClientStudioChat />
        ) : (
          <ChatPanel isActive userName={userName} projectName={projectName} className="flex h-full min-h-0 flex-col" />
        )}
      </div>
    </div>
  );
}
