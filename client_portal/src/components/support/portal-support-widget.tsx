'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowUp, ChevronRight, HelpCircle, Home, Loader2, Mail, MessageCircle, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import useUser from '@/hooks/userUser';
import { fetchData, postData, deleteData } from '@/lib/Api';

type Tab = 'home' | 'messages';

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { error?: string; detail?: string } } }).response?.data;
    if (data?.error) return data.error;
    if (data?.detail) return String(data.detail);
  }
  return fallback;
}

type PortalSupportConfig = {
  apiPrefix: string;
  showStudioMessagesLink?: boolean;
  messagesHref?: string;
};

const CONFIG: PortalSupportConfig = {
  apiPrefix: 'client_portal/support',
};

function getUserDisplayName(user: Record<string, unknown> | null | undefined) {
  if (!user) return '';
  return String(user.name || user.company_name || user.email || '').trim();
}

export function ChatPanel({
  isActive,
  userName,
  projectName,
}: {
  isActive: boolean;
  userName: string;
  projectName?: string;
}) {
  const t = useTranslations('supportWidget.chat');
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || loaded) return;
    fetchData(`${CONFIG.apiPrefix}/conversation/`)
      .then((data: { conversation_id: number | null; messages: Array<{ id: number; role: 'user' | 'assistant'; content: string }> }) => {
        setConversationId(data.conversation_id);
        setMessages(
          (data.messages || []).map((m) => ({ id: String(m.id), role: m.role, content: m.content }))
        );
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [isActive, loaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isSending]);

  const suggested = [t('suggestProcurement'), t('suggestInvoices'), t('suggestDocuments')];

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsSending(true);
    try {
      const res = await postData({
        url: `${CONFIG.apiPrefix}/chat/`,
        data: {
          message: trimmed,
          conversation_id: conversationId,
          page_path: pathname,
          project_name: projectName,
        },
      });
      setConversationId(res.conversation_id);
      setMessages((p) => [...p, { id: `a-${Date.now()}`, role: 'assistant', content: res.reply }]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('sendFailed')));
      try {
        const synced = await fetchData(`${CONFIG.apiPrefix}/conversation/`) as {
          conversation_id: number | null;
          messages: Array<{ id: number; role: 'user' | 'assistant'; content: string }>;
        };
        setConversationId(synced.conversation_id);
        setMessages((synced.messages || []).map((m) => ({ id: String(m.id), role: m.role, content: m.content })));
      } catch {
        // Keep optimistic user message if sync fails.
      }
      setInput(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = async () => {
    try {
      await deleteData({ url: `${CONFIG.apiPrefix}/conversation/clear/`, data: { conversation_id: conversationId } });
      setMessages([]);
      setConversationId(null);
    } catch {
      toast.error(t('clearFailed'));
    }
  };

  const showIntro = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {showIntro ? (
          <div className="space-y-3">
            <p className="text-center text-[13px] leading-relaxed text-gray-500">{t('intro')}</p>
            <div className="flex justify-start">
              <div className="max-w-[92%]">
                <div className="rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 text-[13px] leading-relaxed text-gray-800">
                  {t('greeting', { name: userName || t('there') })}
                </div>
                <p className="mt-1.5 px-1 text-[11px] text-gray-500">
                  FocusPilot AI · {t('aiAgent')} · {t('justNow')}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end' : 'justify-start'}>
            {msg.role === 'assistant' ? (
              <div className="max-w-[92%] space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Sparkles className="h-3 w-3" /> Pilot
                </div>
                <div className="rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {msg.content}
                </div>
                <p className="mt-1.5 flex items-center gap-1 px-1 text-[11px] text-gray-500">
                  <Sparkles className="h-3 w-3" /> FocusPilot AI · {t('aiAgent')}
                </p>
              </div>
            ) : (
              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gray-900 px-3 py-2 text-[13px] text-white">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {isSending ? (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('thinking')}
          </div>
        ) : null}
      </div>
      {showIntro ? (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3">
          {suggested.map((q) => (
            <button key={q} type="button" onClick={() => sendMessage(q)} className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">
              {q}
            </button>
          ))}
        </div>
      ) : null}
      <div className="shrink-0 border-t border-gray-100 p-3">
        <form
          className="flex items-end rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-200"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            rows={1}
            className="min-h-[48px] max-h-28 flex-1 resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0"
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <div className="p-2">
            <Button
              type="submit"
              size="icon"
              className={`h-9 w-9 rounded-xl ${input.trim() ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}
              disabled={!input.trim() || isSending}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PortalSupportWidget() {
  const t = useTranslations('supportWidget');
  const { user, project } = useUser();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const userName = getUserDisplayName(user as Record<string, unknown> | null);
  const projectName = project?.project_name ? String(project.project_name) : '';

  return (
    <>
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 pointer-events-none">
        {open ? (
          <div
            className="pointer-events-auto flex h-[min(580px,calc(100dvh-7rem))] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.2)]"
            role="complementary"
            aria-label={t('launcherLabel')}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <Image src="/brand/Logo.png" alt="Focuspilot" width={36} height={36} className="h-9 w-9 object-contain" />
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">FocusPilot AI</p>
                  <p className="text-xs text-gray-500">{t('headerSubtitle')}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label={t('close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {tab === 'home' ? (
                <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-4 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t('home.greeting', { name: userName || t('home.there') })}</h2>
                  <p className="mt-2 text-sm text-gray-500">{t('home.subtitle')}</p>
                  <button
                    type="button"
                    onClick={() => setTab('messages')}
                    className="mt-5 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-4 text-left hover:bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <Sparkles className="h-4 w-4" /> {t('home.askPilot')}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{t('home.askPilotHint')}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  <a
                    href="mailto:support@focuspilot.io"
                    className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t('home.contactSupport')}</p>
                        <p className="text-xs text-gray-500">{t('home.contactHint')}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </a>
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">{t('home.faqTitle')}</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />{t('home.faq1')}</li>
                      <li className="flex gap-2"><HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />{t('home.faq2')}</li>
                      <li className="flex gap-2"><HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />{t('home.faq3')}</li>
                    </ul>
                  </div>
                </div>
              ) : null}
              {tab === 'messages' ? (
                <ChatPanel isActive={open && tab === 'messages'} userName={userName} projectName={projectName} />
              ) : null}
            </div>

            <nav className="flex shrink-0 border-t border-gray-100 px-1 py-1">
              {(
                [
                  { id: 'home' as const, icon: Home, label: t('tabs.home') },
                  { id: 'messages' as const, icon: MessageCircle, label: t('tabs.messages') },
                ] as const
              ).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium',
                    tab === id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </nav>
          </div>
        ) : null}
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-[1.03]"
            aria-expanded={false}
            aria-label={t('launcherLabel')}
          >
            <Sparkles className="h-6 w-6" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </>
  );
}
