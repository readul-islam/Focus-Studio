'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  Paperclip,
  X,
  Download,
  Share2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  useDesignMessages,
  useDesignChat,
  useDesignGenerate,
  type DesignMessage,
} from '@/hooks/useDesignSessions';
import {
  isAllowedChatFile,
  MAX_CHAT_FILE_BYTES,
  formatFileSize,
} from '@/lib/team-chat-file-utils';
import { DesignShareDialog } from '@/components/design/DesignShareDialog';
import {
  useDesignImageLightbox,
  DesignClickableImage,
  type DesignLightboxSlide,
} from '@/components/design/DesignImageLightbox';
import { gooeyToast as toast } from 'goey-toast';

function makeOptimisticId() {
  return -Math.floor(Math.random() * 1_000_000_000);
}

const SUGGESTED_PROMPTS = [
  'Modern minimalist living room with natural light',
  'Luxury kitchen with marble island and brass accents',
  'Cozy Scandinavian bedroom with warm wood tones',
  'Contemporary exterior facade with large glazing',
];

function DesignStar({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2C12 2 13.5 8.5 17 12C13.5 15.5 12 22 12 22C12 22 10.5 15.5 7 12C10.5 8.5 12 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M2 12C2 12 8.5 10.5 12 7C15.5 10.5 22 12 22 12C22 12 15.5 13.5 12 17C8.5 13.5 2 12 2 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ThinkingSkeleton({ label = 'Thinking...' }: { label?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DesignStar size={16} className="text-[#748971] shrink-0 animate-spin" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="space-y-1.5 pl-0.5">
        <Skeleton className="h-2.5 w-full rounded-full bg-[#748971]/15" />
        <Skeleton className="h-2.5 w-5/6 rounded-full bg-[#748971]/10" />
        <Skeleton className="h-2.5 w-4/6 rounded-full bg-[#748971]/10" />
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="text-[13px] text-gray-700 leading-relaxed mb-1.5">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        ul: ({ children }) => <ul className="space-y-0.5 mb-1.5">{children}</ul>,
        li: ({ children }) => (
          <li className="flex gap-1.5 text-xs text-gray-700 leading-relaxed">
            <span className="text-[#748971] shrink-0 mt-0.5">•</span>
            <span>{children}</span>
          </li>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function GeneratedImageBlock({
  imageUrl,
  assetId,
  onShare,
  onOpenFullscreen,
}: {
  imageUrl: string;
  assetId: number;
  onShare: () => void;
  onOpenFullscreen: () => void;
}) {
  return (
    <div className="space-y-2 max-w-md">
      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
        <DesignClickableImage
          src={imageUrl}
          alt="Generated design render"
          className="absolute inset-0 w-full h-full"
          onOpen={onOpenFullscreen}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={imageUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </a>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-1.5 text-xs text-white px-2.5 py-1.5 rounded-lg bg-[#748971] hover:bg-[#5f7560]"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share or attach
        </button>
      </div>
    </div>
  );
}

type Props = {
  sessionId: number;
  designType: 'interior' | 'exterior';
  onDesignTypeChange: (t: 'interior' | 'exterior') => void;
  canEdit: boolean;
};

export function DesignChatPanel({
  sessionId,
  designType,
  onDesignTypeChange,
  canEdit,
}: Props) {
  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<DesignMessage[]>([]);
  const [shareTarget, setShareTarget] = useState<{
    fileUrl: string;
    assetId: number;
    downloadFilename: string;
  } | null>(null);
  const [generatePhase, setGeneratePhase] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading: messagesLoading, refetch } = useDesignMessages(sessionId);
  const chatMutation = useDesignChat(sessionId);
  const generateMutation = useDesignGenerate(sessionId);

  const isPending = chatMutation.isPending || generateMutation.isPending;

  const displayMessages = [...messages, ...optimisticMessages];

  const { openImage, LightboxModal } = useDesignImageLightbox();

  const sessionImageGallery = useMemo((): DesignLightboxSlide[] => {
    const slides: DesignLightboxSlide[] = [];
    for (const msg of displayMessages) {
      if (msg.sketch_url) {
        slides.push({ src: msg.sketch_url, alt: 'Uploaded sketch' });
      }
      if (msg.image_url) {
        slides.push({ src: msg.image_url, alt: 'Generated design' });
      }
    }
    return slides;
  }, [displayMessages]);

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [displayMessages, isPending, scrollBottom]);

  // Object URLs for pending file thumbnails
  useEffect(() => {
    const urls = pendingFiles.map(f => URL.createObjectURL(f));
    setPendingPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [pendingFiles]);

  const addFiles = (files: FileList | File[]) => {
    const next: File[] = [];
    for (const f of Array.from(files)) {
      if (!isAllowedChatFile(f) || f.type.startsWith('video/')) {
        toast.error(`${f.name} is not a supported image`);
        continue;
      }
      if (f.size > MAX_CHAT_FILE_BYTES) {
        toast.error(`${f.name} exceeds ${formatFileSize(MAX_CHAT_FILE_BYTES)}`);
        continue;
      }
      if (!f.type.startsWith('image/')) {
        toast.error('Only image sketches are supported for design generation');
        continue;
      }
      next.push(f);
    }
    if (next.length) setPendingFiles(prev => [...prev, ...next].slice(0, 4));
  };

  const handleGenerate = () => {
    if (!canEdit) {
      toast.error("You don't have permission to generate designs");
      return;
    }
    const trimmed = input.trim();
    if (!trimmed && pendingFiles.length === 0) {
      toast.error('Add a prompt or upload a sketch');
      return;
    }

    const sketchPreview = pendingPreviews[0] ?? null;
    setOptimisticMessages([
      {
        id: makeOptimisticId(),
        role: 'user',
        content: trimmed || 'Generate a design from the uploaded sketch.',
        sketch_url: sketchPreview,
        image_url: null,
        asset_id: null,
        created_at: new Date().toISOString(),
      },
    ]);

    setGeneratePhase('Analyzing sketch…');
    const phaseTimer = setTimeout(() => setGeneratePhase('Rendering design…'), 3000);

    generateMutation.mutate(
      { prompt: trimmed, design_type: designType, files: [...pendingFiles] },
      {
        onSuccess: () => {
          clearTimeout(phaseTimer);
          setInput('');
          setPendingFiles([]);
          setOptimisticMessages([]);
          setGeneratePhase(null);
        },
        onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
          clearTimeout(phaseTimer);
          setOptimisticMessages([]);
          setGeneratePhase(null);
          const msg =
            err?.response?.data?.error || err?.message || 'Generation failed';
          toast.error(msg);
        },
      }
    );
  };

  const handleChat = () => {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;
    if (!canEdit) {
      toast.error("You don't have permission to chat");
      return;
    }

    setOptimisticMessages([
      {
        id: makeOptimisticId(),
        role: 'user',
        content: trimmed,
        sketch_url: null,
        image_url: null,
        asset_id: null,
        created_at: new Date().toISOString(),
      },
    ]);
    setInput('');

    chatMutation.mutate(trimmed, {
      onSuccess: () => setOptimisticMessages([]),
      onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
        setOptimisticMessages([]);
        toast.error(err?.response?.data?.error || 'Chat failed');
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (pendingFiles.length > 0) handleGenerate();
      else handleChat();
    }
  };

  const isEmpty =
    displayMessages.length === 0 && !isPending && !messagesLoading;

  return (
    <div className="flex flex-col h-full bg-white min-w-0">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <DesignStar size={20} className="text-[#748971]" />
          <span className="text-[15px] font-medium text-gray-900">Design Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={designType}
            onChange={e => onDesignTypeChange(e.target.value as 'interior' | 'exterior')}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
            aria-label="Design type"
          >
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 pb-4 text-center">
          <DesignStar size={38} className="text-[#748971] mb-4 opacity-80" />
          <p className="text-xl font-medium text-[#748971] mb-2 leading-tight">
            Interior & exterior design
          </p>
          <p className="text-sm text-gray-500 mb-8 max-w-sm">
            Upload a sketch or diagram, describe your vision, and generate photorealistic design renders.
          </p>
          <div className="w-full max-w-md space-y-1">
            {SUGGESTED_PROMPTS.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => setInput(q)}
                className="w-full text-left text-[13px] text-gray-700 font-medium hover:bg-gray-100 px-3 py-2 rounded-md transition-colors flex items-center gap-2.5 group"
              >
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-[#748971]" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 min-h-0">
          {messagesLoading && <ThinkingSkeleton />}
          {displayMessages.map((msg: DesignMessage) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onShare={(url, id) =>
                setShareTarget({
                  fileUrl: url,
                  assetId: id,
                  downloadFilename: `design-render-${id}.png`,
                })
              }
              onOpenImage={(src, alt) =>
                openImage(src, { alt, gallery: sessionImageGallery })
              }
            />
          ))}
          {isPending && (
            <ThinkingSkeleton
              label={generatePhase || 'Thinking...'}
            />
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="px-4 pb-4 pt-2 shrink-0 border-t border-gray-100">
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 justify-end">
            {pendingFiles.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 w-20 h-20 shrink-0"
              >
                {pendingPreviews[i] ? (
                  <DesignClickableImage
                    src={pendingPreviews[i]}
                    alt={f.name}
                    className="w-full h-full"
                    onOpen={() =>
                      openImage(pendingPreviews[i], {
                        alt: f.name,
                        gallery: pendingPreviews.map((src, j) => ({
                          src,
                          alt: pendingFiles[j]?.name ?? 'Sketch',
                        })),
                      })
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Paperclip className="w-4 h-4" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-gray-300 focus-within:bg-white transition-all shadow-sm">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = '0px';
              requestAnimationFrame(() => {
                el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
              });
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe your design or upload a sketch below…"
            disabled={!canEdit}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none px-4 pt-3 pb-1 leading-relaxed max-h-40 overflow-y-auto"
            style={{ minHeight: '40px' }}
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1 gap-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                title="Upload sketch"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-gray-400 hidden sm:inline">
                Enter to send · Shift+Enter newline
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {(pendingFiles.length > 0 || input.trim()) && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isPending || !canEdit || (!input.trim() && pendingFiles.length === 0)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#748971] text-white text-xs font-medium hover:bg-[#5f7560] disabled:opacity-40"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Generate
                </button>
              )}
              <button
                type="button"
                onClick={handleChat}
                disabled={!input.trim() || isPending || !canEdit}
                className="w-8 h-8 rounded-full bg-[#748971] flex items-center justify-center disabled:opacity-30 hover:bg-[#5f7560] transition-colors shrink-0"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          AI-generated designs may need professional review before client presentation.
        </p>
      </div>

      {shareTarget && (
        <DesignShareDialog
          open={!!shareTarget}
          onClose={() => setShareTarget(null)}
          fileUrl={shareTarget.fileUrl}
          assetId={shareTarget.assetId}
          downloadFilename={shareTarget.downloadFilename}
        />
      )}

      <LightboxModal />
    </div>
  );
}

function MessageBubble({
  msg,
  onShare,
  onOpenImage,
}: {
  msg: DesignMessage;
  onShare: (url: string, assetId: number) => void;
  onOpenImage: (src: string, alt: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (msg.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto">
        {msg.sketch_url && (
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <DesignClickableImage
              src={msg.sketch_url}
              alt="Uploaded sketch"
              className="w-full h-full"
              onOpen={() => onOpenImage(msg.sketch_url!, 'Uploaded sketch')}
            />
          </div>
        )}
        {msg.content ? (
          <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed">
            {msg.content}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <DesignStar size={18} className="text-[#748971]" />
      {msg.image_url && msg.asset_id ? (
        <GeneratedImageBlock
          imageUrl={msg.image_url}
          assetId={msg.asset_id}
          onShare={() => onShare(msg.image_url!, msg.asset_id!)}
          onOpenFullscreen={() => onOpenImage(msg.image_url!, 'Generated design')}
        />
      ) : null}
      {msg.content && <MarkdownContent content={msg.content} />}
      {!msg.image_url && msg.content && (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(msg.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      )}
    </div>
  );
}
