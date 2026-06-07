'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUp, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import { postData, deleteData, fetchData } from '@/lib/Api';
import {
  buildArticleContextForMessage,
  getContextSuggestionKeys,
  getPageContextLabel,
} from '@/lib/support-context';
import { SupportMarkdown } from '@/components/support/support-markdown';
import { gooeyToast as toast } from 'goey-toast';
import { cn } from '@/lib/utils';

export type SupportChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ConversationResponse = {
  conversation_id: number | null;
  messages: Array<{ id: number; role: 'user' | 'assistant'; content: string }>;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { error?: string; detail?: string } } }).response?.data;
    if (data?.error) return data.error;
    if (data?.detail) return String(data.detail);
  }
  return fallback;
}

async function loadConversationMessages(): Promise<ConversationResponse> {
  return fetchData('help/support/conversation/');
}

function mapConversationMessages(data: ConversationResponse): SupportChatMessage[] {
  return (data.messages || []).map((m) => ({
    id: String(m.id),
    role: m.role,
    content: m.content,
  }));
}

type Props = {
  isActive: boolean;
  userName?: string;
  onNewConversation?: () => void;
};

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}

export function SupportChatPanel({ isActive, userName, onNewConversation }: Props) {
  const t = useTranslations('supportWidget.chat');
  const pathname = usePathname();
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const pageLabel = getPageContextLabel(pathname);
  const suggestionKeys = getContextSuggestionKeys(pathname);

  const { data, refetch, isLoading } = useFetch<ConversationResponse>('help/support/conversation/', {
    enabled: isActive && !hasLoaded,
  });

  useEffect(() => {
    if (!data || hasLoaded) return;
    setConversationId(data.conversation_id);
    setMessages(mapConversationMessages(data));
    setHasLoaded(true);
  }, [data, hasLoaded]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userMsg: SupportChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const article_context = buildArticleContextForMessage(trimmed);
      const response = await postData<{ reply: string; conversation_id: number }>({
        url: 'help/support/chat/',
        data: {
          message: trimmed,
          conversation_id: conversationId,
          page_path: pathname,
          article_context,
        },
      });

      setConversationId(response.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
        },
      ]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('sendFailed')));
      try {
        const synced = await loadConversationMessages();
        setConversationId(synced.conversation_id);
        setMessages(mapConversationMessages(synced));
      } catch {
        // Keep optimistic user message if sync fails.
      }
      setInput(trimmed);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const clearConversation = async () => {
    try {
      await deleteData({
        url: 'help/support/conversation/clear/',
        data: { conversation_id: conversationId },
      });
      setMessages([]);
      setConversationId(null);
      setHasLoaded(true);
      refetch();
      onNewConversation?.();
    } catch {
      toast.error(t('clearFailed'));
    }
  };

  const showEmptyState = messages.length === 0 && !isLoading && hasLoaded;
  const displayName = userName?.trim() || t('there');

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {isLoading && !hasLoaded ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('loading')}
          </div>
        ) : null}

        {showEmptyState ? (
          <div className="space-y-4">
            {pageLabel ? (
              <div className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {t('contextLabel', { page: pageLabel })}
              </div>
            ) : null}

            <p className="text-center text-[13px] leading-relaxed text-muted-foreground">{t('intro')}</p>

            <div className="flex justify-start">
              <div className="max-w-[92%]">
                <div className="rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3 text-[13px] leading-relaxed text-foreground">
                  {t('greeting', { name: displayName })}
                </div>
                <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
                  FocusPilot AI · {t('aiAgent')} · {t('justNow')}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' ? (
                <div className="max-w-[92%]">
                  <div className="rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3">
                    <SupportMarkdown content={msg.content} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    FocusPilot AI · {t('aiAgent')}
                  </p>
                </div>
              ) : (
                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-foreground px-4 py-2.5 text-[13px] leading-relaxed text-background">
                  {msg.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {isSending ? (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ThinkingDots />
            <span>{t('thinking')}</span>
          </div>
        ) : null}
      </div>

      {(showEmptyState || messages.length > 0) && !isSending ? (
        <div className="shrink-0 border-t border-border px-4 py-2.5">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggestionKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => sendMessage(t(key))}
                className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-left text-[11px] text-foreground transition-colors hover:bg-muted/50"
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-border p-3 pt-2">
        <form
          className="relative flex items-end rounded-2xl border border-border bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            rows={1}
            className="max-h-28 min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={isSending}
          />
          <div className="flex shrink-0 items-center gap-1 p-2">
            <Button
              type="submit"
              size="icon"
              className={cn(
                'h-9 w-9 rounded-xl transition-all',
                input.trim() ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
              disabled={!input.trim() || isSending}
              aria-label={t('send')}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </form>
        {messages.length > 0 ? (
          <button
            type="button"
            onClick={clearConversation}
            className="mt-2 w-full text-center text-[11px] text-muted-foreground hover:text-foreground"
          >
            {t('newConversation')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
