'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { X, Send, RotateCcw, Copy, Check, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePost } from '@/hooks/usePost';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslations } from 'next-intl';

// ─── Types ────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

function useSuggestedQuestions() {
  const t = useTranslations('reportsCommon');
  return [
    t('suggestSummarize'),
    t('suggestCosts'),
    t('suggestMargin'),
    t('suggestBudget'),
  ];
}

// ─── Gemini 4-point star ──────────────────────────────────────────
function GeminiStar({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C12 2 13.5 8.5 17 12C13.5 15.5 12 22 12 22C12 22 10.5 15.5 7 12C10.5 8.5 12 2 12 2Z" fill="currentColor" />
      <path d="M2 12C2 12 8.5 10.5 12 7C15.5 10.5 22 12 22 12C22 12 15.5 13.5 12 17C8.5 13.5 2 12 2 12Z" fill="currentColor" />
    </svg>
  );
}

// ─── Thinking skeleton ────────────────────────────────────────────
function ThinkingSkeleton() {
  const t = useTranslations('reportsCommon');
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <GeminiStar size={16} className="text-[#748971] shrink-0 animate-spin" />
        <span className="text-xs text-gray-400">{t('thinking')}</span>
      </div>
      <div className="space-y-1.5 pl-0.5">
        <Skeleton className="h-2.5 w-full rounded-full bg-[#748971]/15" />
        <Skeleton className="h-2.5 w-5/6 rounded-full bg-[#748971]/10" />
        <Skeleton className="h-2.5 w-4/6 rounded-full bg-[#748971]/10" />
      </div>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="text-[13px] text-gray-700 leading-relaxed mb-1.5">{children}</p>,
        h2: ({ children }) => <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1">{children}</p>,
        h3: ({ children }) => <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        ul: ({ children }) => <ul className="space-y-0.5 mb-1.5">{children}</ul>,
        li: ({ children }) => (
          <li className="flex gap-1.5 text-xs text-gray-700 leading-relaxed">
            <span className="text-[#748971] shrink-0 mt-0.5">•</span>
            <span>{children}</span>
          </li>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-gray-100">{children}</tr>,
        th: ({ children }) => <th className="text-left text-[11px] font-semibold text-gray-600 border-b border-gray-200 pb-1.5 pr-4">{children}</th>,
        td: ({ children }) => <td className="py-1 pr-4 text-xs text-gray-700">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── AI reply with typewriter + copy ─────────────────────────────
function AIReply({ content }: { content: string }) {
  const t = useTranslations('reportsCommon');
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const indexRef = useRef(0);
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    const tick = () => {
      if (indexRef.current >= content.length) { setDone(true); return; }
      const next = indexRef.current + 4;
      setDisplayed(content.slice(0, next));
      indexRef.current = next;
      frameRef.current = setTimeout(tick, 12);
    };
    frameRef.current = setTimeout(tick, 12);
    return () => { if (frameRef.current) clearTimeout(frameRef.current); };
  }, [content]);

  return (
    <div className="space-y-1.5">
      <GeminiStar size={18} className="text-[#748971]" />
      <MarkdownContent content={displayed} />
      {!done && <span className="inline-block w-0.5 h-3.5 bg-[#748971] animate-pulse rounded-full ml-0.5" />}
      {done && (
        <button
          onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1 pb-2"
        >
          {copied ? <><Check className="w-3.5 h-3.5" /><span>{t('copied')}</span></> : <><Copy className="w-3.5 h-3.5" /><span>{t('copy')}</span></>}
        </button>
      )}
    </div>
  );
}

// ─── Chat panel (internal) ────────────────────────────────────────
function AIChatPanel({ onClose }: { onClose: () => void }) {
  const t = useTranslations('reportsCommon');
  const suggestedQuestions = useSuggestedQuestions();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollBottom, [messages]);

  const { mutate: sendChat, isPending } = usePost({
    onSuccess: (data: any) => {
      const reply = typeof data.reply === 'string' ? data.reply : JSON.stringify(data.reply);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reply }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t('serverError') }]);
    },
  });

  useEffect(scrollBottom, [isPending]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: trimmed }]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '40px';
    sendChat({ url: '/reports/chat/', data: { message: trimmed } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const isEmpty = messages.length === 0 && !isPending;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <GeminiStar size={20} className="text-[#748971]" />
          <span className="text-[15px] font-medium text-gray-900">{t('insightsTitle')}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setMessages([])} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title={t('newChat')}>
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 pb-4 text-center">
          <GeminiStar size={38} className="text-[#748971] mb-4 opacity-80" />
          <p className="text-xl font-medium text-[#748971] mb-8 leading-tight whitespace-pre-line">{t('askHeadline')}</p>
          <div className="w-full space-y-1">
            {suggestedQuestions.map(q => (
              <button key={q} onClick={() => sendMessage(q)} className="w-full text-left text-[13px] text-gray-700 font-medium hover:bg-gray-100 px-3 py-2 rounded-md transition-colors flex items-center gap-2.5 group">
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-[#748971] transition-colors" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {!isEmpty && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 min-h-0">
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[82%] bg-gray-100 text-gray-800 rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed">{msg.content}</div>
                </div>
              ) : (
                <AIReply content={msg.content} />
              )}
            </div>
          ))}
          {isPending && <ThinkingSkeleton />}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-2 pt-2 shrink-0">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-gray-300 focus-within:bg-white transition-all shadow-sm">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = '0px';
              requestAnimationFrame(() => { el.style.height = `${el.scrollHeight}px`; });
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('askPlaceholder')}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none px-4 pt-3 pb-1 leading-relaxed max-h-40 overflow-y-auto transition-[height] duration-150 ease-out"
            style={{ height: '40px' }}
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <span className="text-[10px] text-gray-400">{t('sendHint')}</span>
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isPending} className="w-8 h-8 rounded-full bg-[#748971] flex items-center justify-center disabled:opacity-30 hover:bg-[#5f7560] transition-colors shrink-0">
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">{t('disclaimer')}</p>
      </div>
    </div>
  );
}

// ─── Trigger button ───────────────────────────────────────────────
export function ReportInsightsButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations('reportsCommon');
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm border border-clay-200/60 bg-gradient-to-br from-neutral-50 via-[#f5ede4] to-[#f5ede4]/20 hover:shadow-md hover:brightness-95 text-clay-700"
    >
      <span className="text-clay-500 animate-pulse">
        <GeminiStar size={15} />
      </span>
      {t('insightsButton')}
    </button>
  );
}

// ─── Layout wrapper — use this on every report page ───────────────
// Replaces <main className="flex-1 bg-stone-50 p-6"> on each page.
// Usage:
//   <ReportPageLayout>
//     ... page content ...
//   </ReportPageLayout>
export function ReportPageLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSetOpen = (v: boolean) => {
    setOpen(v);
    if (v && !isMobile) {
      const wasCollapsed = localStorage.getItem('sidebarCollapsed');
      if (wasCollapsed !== 'true') {
        localStorage.setItem('sidebarCollapsed', 'true');
        window.dispatchEvent(new StorageEvent('storage', { key: 'sidebarCollapsed', newValue: 'true' }));
      }
    }
  };

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Scrollable content area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-stone-50 p-6">
        <ReportInsightsContext.Provider value={{ open, setOpen: handleSetOpen }}>
          {children}
        </ReportInsightsContext.Provider>
      </main>

      {/* Desktop: inline sidebar that pushes content */}
      {!isMobile && (
        <div className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out h-full ${open ? 'w-[360px]' : 'w-0'}`}>
          <div className="w-[360px] h-full">
            <AIChatPanel onClose={() => handleSetOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile: fixed overlay from bottom */}
      {isMobile && open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => handleSetOpen(false)} />
          <div className="relative w-full h-[85vh] rounded-t-2xl overflow-hidden shadow-2xl">
            <AIChatPanel onClose={() => handleSetOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

// Context so the button inside children can trigger open
export const ReportInsightsContext = React.createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => {} });

// Button that reads from context — drop this anywhere inside ReportPageLayout
export function ReportInsights() {
  const { open, setOpen } = React.useContext(ReportInsightsContext);
  if (open) return null;
  return <ReportInsightsButton onClick={() => setOpen(true)} />;
}
