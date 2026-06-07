'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { HelpCircle, Home, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUser from '@/hooks/useUser';
import { shouldShowSupportWidget } from '@/lib/support-context';
import { SupportHomePanel } from '@/components/support/support-home-panel';
import { SupportChatPanel } from '@/components/support/support-chat-panel';
import { SupportHelpPanel } from '@/components/support/support-help-panel';
import { SupportWidgetHeader } from '@/components/support/support-widget-header';

type Tab = 'home' | 'messages' | 'help';

const STORAGE_KEY = 'focuspilot-support-tab';

export function SupportWidget() {
  const t = useTranslations('supportWidget');
  const pathname = usePathname();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('messages');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(STORAGE_KEY) as Tab | null;
    if (stored === 'home' || stored === 'messages' || stored === 'help') {
      setTab(stored);
    }
  }, [mounted]);

  if (!mounted || !shouldShowSupportWidget(pathname)) return null;

  const switchTab = (next: Tab) => {
    setTab(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const userName = user?.first_name || user?.name || '';
  const headerSubtitle =
    tab === 'messages' ? t('header.chatSubtitle') : tab === 'help' ? t('header.helpSubtitle') : t('header.homeSubtitle');

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pointer-events-none">
        {open ? (
          <div
            className={cn(
              'pointer-events-auto flex w-[min(100vw-1.5rem,400px)] flex-col overflow-hidden rounded-2xl border border-border bg-background',
              'shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)]',
              'h-[min(620px,calc(100dvh-5.5rem))]'
            )}
            role="complementary"
            aria-label={t('launcherLabel')}
          >
            <SupportWidgetHeader
              subtitle={headerSubtitle}
              onClose={() => setOpen(false)}
              emailSupportLabel={t('home.contactSupport')}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {tab === 'home' ? (
                <SupportHomePanel
                  userName={userName}
                  onOpenChat={() => switchTab('messages')}
                  onOpenHelp={() => switchTab('help')}
                />
              ) : null}
              {tab === 'messages' ? (
                <SupportChatPanel isActive={open && tab === 'messages'} userName={userName} />
              ) : null}
              {tab === 'help' ? <SupportHelpPanel /> : null}
            </div>

            <nav
              className="flex shrink-0 border-t border-border bg-background/95 px-1 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/80"
              aria-label={t('tabsAria')}
            >
              {(
                [
                  { id: 'home' as const, icon: Home, label: t('tabs.home') },
                  { id: 'messages' as const, icon: MessageCircle, label: t('tabs.ai') },
                  { id: 'help' as const, icon: HelpCircle, label: t('tabs.help') },
                ] as const
              ).map(({ id, icon: Icon, label }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => switchTab(id)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-colors',
                      active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', id === 'messages' && active && 'text-primary')} strokeWidth={active ? 2.25 : 2} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        ) : null}

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'pointer-events-auto group flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-foreground text-background',
              'shadow-lg shadow-black/20 transition-all hover:scale-[1.03] hover:shadow-xl'
            )}
            aria-expanded={false}
            aria-label={t('launcherLabel')}
          >
            <Sparkles className="h-6 w-6 transition-transform group-hover:scale-110" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </>
  );
}
