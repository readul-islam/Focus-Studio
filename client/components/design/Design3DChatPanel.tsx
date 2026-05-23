'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowRight,
  Paperclip,
  X,
  Download,
  Share2,
  Loader2,
  Box,
  Maximize2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDesignMessages,
  useDesignGenerate3d,
  useMeshyStatus,
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
import { DesignModelViewer } from '@/components/design/DesignModelViewer';
import { DesignModelLightbox } from '@/components/design/DesignModelLightbox';
import { fetchDesignModelBlob } from '@/lib/design-model-api';
import { gooeyToast as toast } from 'goey-toast';

function makeOptimisticId() {
  return -Math.floor(Math.random() * 1_000_000_000);
}

const SUGGESTED_PROMPTS = [
  'Modern dining chair, Scandinavian wood',
  'Minimalist floor lamp for living room',
  'Exterior facade element, contemporary glass',
  'Kitchen island with marble top',
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

function ThinkingSkeleton({ label = 'Generating 3D…' }: { label?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DesignStar size={16} className="text-sage-700 shrink-0 animate-spin" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <Skeleton className="h-48 w-full max-w-md rounded-xl bg-sage-500/10" />
    </div>
  );
}

type Props = {
  sessionId: number;
  designType: 'interior' | 'exterior';
  onDesignTypeChange: (t: 'interior' | 'exterior') => void;
  canEdit: boolean;
};

export function Design3DChatPanel({
  sessionId,
  designType,
  onDesignTypeChange,
  canEdit,
}: Props) {
  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<DesignMessage[]>([]);
  const [generatePhase, setGeneratePhase] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<{
    fileUrl: string;
    assetId: number;
    downloadFilename: string;
  } | null>(null);
  const [modelLightboxAssetId, setModelLightboxAssetId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading: messagesLoading } = useDesignMessages(sessionId);
  const generate3d = useDesignGenerate3d(sessionId);
  const { data: meshyStatus } = useMeshyStatus();

  const displayMessages = [...messages, ...optimisticMessages];
  const isPending = generate3d.isPending;
  const { openImage, LightboxModal } = useDesignImageLightbox();

  const sketchGallery = useMemo((): DesignLightboxSlide[] => {
    const slides: DesignLightboxSlide[] = [];
    for (const msg of displayMessages) {
      if (msg.sketch_url) slides.push({ src: msg.sketch_url, alt: 'Sketch' });
    }
    return slides;
  }, [displayMessages]);

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [displayMessages, isPending, scrollBottom]);

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
        toast.error('Only image sketches are supported');
        continue;
      }
      next.push(f);
    }
    if (next.length) setPendingFiles([next[0]]);
  };

  const handleGenerate3d = () => {
    if (!canEdit) {
      toast.error("You don't have permission to generate 3D designs");
      return;
    }
    if (pendingFiles.length === 0) {
      toast.error('Upload a sketch to generate 3D');
      return;
    }
    const trimmed = input.trim();
    setOptimisticMessages([
      {
        id: makeOptimisticId(),
        role: 'user',
        content: trimmed || 'Generate a 3D model from this sketch.',
        sketch_url: pendingPreviews[0] ?? null,
        image_url: null,
        model_url: null,
        asset_id: null,
        created_at: new Date().toISOString(),
      },
    ]);
    setGeneratePhase('Sending to Meshy…');
    const t1 = setTimeout(() => setGeneratePhase('Building 3D mesh…'), 4000);
    const t2 = setTimeout(() => setGeneratePhase('Texturing model…'), 12000);

    generate3d.mutate(
      { prompt: trimmed, design_type: designType, files: [...pendingFiles] },
      {
        onSuccess: (data) => {
          clearTimeout(t1);
          clearTimeout(t2);
          setInput('');
          setPendingFiles([]);
          setOptimisticMessages([]);
          setGeneratePhase(null);
          if (data.test_mode) {
            toast.success('3D model ready (Meshy test mode — sample GLB)');
          } else {
            toast.success('3D model generated');
          }
        },
        onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
          clearTimeout(t1);
          clearTimeout(t2);
          setOptimisticMessages([]);
          setGeneratePhase(null);
          toast.error(err?.response?.data?.error || err?.message || '3D generation failed');
        },
      }
    );
  };

  const isEmpty = displayMessages.length === 0 && !isPending && !messagesLoading;

  return (
    <div className="flex flex-col h-full bg-white min-w-0">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-sage-700" />
          <span className="text-[15px] font-medium text-gray-900">3D Design Studio</span>
          {meshyStatus?.test_mode && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              Meshy test
            </span>
          )}
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
        </div>
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 pb-4 text-center">
          <Box className="w-10 h-10 text-sage-700 mb-4" />
          <p className="text-xl font-medium text-gray-900 mb-2">Sketch to 3D model</p>
          <p className="text-sm text-gray-500 mb-8 max-w-sm">
            Upload a sketch or product photo. Meshy turns it into a rotatable GLB model you can
            attach to projects and share with your team.
          </p>
          <div className="w-full max-w-md space-y-1">
            {SUGGESTED_PROMPTS.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => setInput(q)}
                className="w-full text-left text-[13px] text-gray-700 font-medium hover:bg-stone-100 px-3 py-2 rounded-md transition-colors flex items-center gap-2.5 group"
              >
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-sage-700" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 min-h-0">
          {messagesLoading && <ThinkingSkeleton />}
          {displayMessages.map(msg => (
            <Message3DBubble
              key={msg.id}
              msg={msg}
              onOpenSketch={url => openImage(url, { alt: 'Sketch', gallery: sketchGallery })}
              onOpenModelFullscreen={id => setModelLightboxAssetId(id)}
              onShare={(url, id) =>
                setShareTarget({
                  fileUrl: url,
                  assetId: id,
                  downloadFilename: `design-model-${id}.glb`,
                })
              }
            />
          ))}
          {isPending && <ThinkingSkeleton label={generatePhase || 'Generating 3D…'} />}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="px-4 pb-4 pt-2 shrink-0 border-t border-stone-200">
        {pendingPreviews[0] && (
          <div className="flex flex-wrap gap-2 mb-2 justify-end">
            <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 w-20 h-20 shrink-0">
              <DesignClickableImage
                src={pendingPreviews[0]}
                alt="Sketch"
                className="w-full h-full"
                onOpen={() =>
                  openImage(pendingPreviews[0], { alt: 'Sketch', gallery: sketchGallery })
                }
              />
              <button
                type="button"
                onClick={() => setPendingFiles([])}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove sketch"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
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
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate3d();
              }
            }}
            placeholder="Describe materials and style (optional)…"
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
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-stone-100 disabled:opacity-40"
                title="Upload sketch"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-gray-400 hidden sm:inline">
                Enter to generate · Shift+Enter newline
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleGenerate3d}
                disabled={isPending || !canEdit || pendingFiles.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-40"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Box className="w-3.5 h-3.5" />
                )}
                Generate 3D
              </button>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Powered by Meshy · Generation may take 1–3 minutes
        </p>
      </div>

      <LightboxModal />
      {modelLightboxAssetId && (
        <DesignModelLightbox
          open={!!modelLightboxAssetId}
          assetId={modelLightboxAssetId}
          onClose={() => setModelLightboxAssetId(null)}
        />
      )}
      {shareTarget && (
        <DesignShareDialog
          open={!!shareTarget}
          onClose={() => setShareTarget(null)}
          fileUrl={shareTarget.fileUrl}
          assetId={shareTarget.assetId}
          downloadFilename={shareTarget.downloadFilename}
        />
      )}
    </div>
  );
}

function ModelDownloadButton({ assetId, filename }: { assetId: number; filename: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await fetchDesignModelBlob(assetId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      Download GLB
    </button>
  );
}

function Message3DBubble({
  msg,
  onOpenSketch,
  onOpenModelFullscreen,
  onShare,
}: {
  msg: DesignMessage;
  onOpenSketch: (url: string) => void;
  onOpenModelFullscreen: (assetId: number) => void;
  onShare: (url: string, id: number) => void;
}) {
  if (msg.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto">
        {msg.sketch_url && (
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <DesignClickableImage
              src={msg.sketch_url}
              alt="Sketch"
              className="w-full h-full"
              onOpen={() => onOpenSketch(msg.sketch_url!)}
            />
          </div>
        )}
        {msg.content && (
          <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed">
            {msg.content}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-lg">
      <DesignStar size={18} className="text-sage-700" />
      {msg.model_url && msg.asset_id && (
        <>
          <button
            type="button"
            onClick={() => onOpenModelFullscreen(msg.asset_id!)}
            className="relative group w-full text-left rounded-xl overflow-hidden cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500"
            title="Open fullscreen"
          >
            <DesignModelViewer assetId={msg.asset_id} minHeight={300} />
            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/55 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Maximize2 className="w-3.5 h-3.5" />
              Fullscreen
            </span>
          </button>
          <p className="text-[11px] text-gray-400">Click model for fullscreen · press Esc or Close to exit</p>
          <div className="flex flex-wrap gap-2">
            <ModelDownloadButton assetId={msg.asset_id} filename={`design-model-${msg.asset_id}.glb`} />
            <button
              type="button"
              onClick={() => onShare(msg.model_url!, msg.asset_id!)}
              className="inline-flex items-center gap-1.5 text-xs text-white px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share or attach
            </button>
          </div>
        </>
      )}
      {msg.content && <p className="text-[13px] text-gray-700">{msg.content}</p>}
    </div>
  );
}
