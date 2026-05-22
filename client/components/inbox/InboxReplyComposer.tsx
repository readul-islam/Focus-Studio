'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Paperclip, Send, Sparkles, X } from 'lucide-react';
import { RichTextEditor } from '@/components/inbox/RichTextEditor';
import { htmlHasContent } from '@/lib/html-content';
import { sanitizeComposeHtml } from '@/lib/sanitize-html';
import { postData } from '@/lib/Api';
import { getApiErrorMessage } from '@/lib/api-error';
import { gooeyToast as toast } from 'goey-toast';

const ACCEPT_FILES =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/msword';

function FilePreviewThumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  if (!url) return <Paperclip className="w-3.5 h-3.5 text-gray-500 shrink-0" />;
  return <img src={url} alt={file.name} className="w-10 h-10 object-cover rounded" />;
}

type InboxReplyComposerProps = {
  replyBody: string;
  setReplyBody: (value: string) => void;
  onSend: (files: File[]) => void;
  isSending: boolean;
  threadId?: string | null;
  subject?: string | null;
  embedded?: boolean;
  placeholder?: string;
  sendTitle?: string;
};

export function InboxReplyComposer({
  replyBody,
  setReplyBody,
  onSend,
  isSending,
  threadId,
  subject,
  embedded = false,
  placeholder = 'Write a reply...',
  sendTitle = 'Send reply',
}: InboxReplyComposerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isPolishing, setIsPolishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = isSending || isPolishing;
  const canSend = Boolean(htmlHasContent(replyBody) || files.length);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    setFiles((prev) => {
      const next = [...prev];
      for (const file of Array.from(incoming)) {
        if (!next.some((f) => f.name === file.name && f.size === file.size)) {
          next.push(file);
        }
      }
      return next;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePolish = async () => {
    if (!htmlHasContent(replyBody)) {
      toast.error('Write a reply first, then use the AI assistant.');
      return;
    }
    setIsPolishing(true);
    try {
      const res = await postData({
        url: 'gmail/polish-reply/',
        data: {
          body: replyBody,
          thread_id: threadId || undefined,
          subject: subject || undefined,
        },
      }) as { body?: string };
      if (!res?.body) {
        throw new Error('No polished text returned');
      }
      setReplyBody(sanitizeComposeHtml(res.body));
      toast.success('Reply polished by AI');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'AI assistant failed'));
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSend = () => {
    if (!canSend || busy) return;
    onSend(files);
    setFiles([]);
    setReplyBody('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className={
        embedded
          ? 'flex-shrink-0'
          : 'flex-shrink-0 p-4 border-t border-gray-100 bg-white'
      }
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-2 text-xs bg-stone-100 border border-stone-200 rounded-lg px-2 py-1.5 max-w-full"
            >
              <FilePreviewThumb file={file} />
              <span className="truncate max-w-[140px] font-medium text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-700"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_FILES}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all overflow-hidden">
        <RichTextEditor
          value={replyBody}
          onChange={(html) => setReplyBody(sanitizeComposeHtml(html))}
          placeholder={placeholder}
          disabled={busy}
          fullWidthToolbar
          className="border-0 shadow-none rounded-none"
          leadingActions={
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-violet-600 hover:text-violet-800 hover:bg-violet-50"
                onClick={handlePolish}
                disabled={busy}
                title="AI assistant — fix grammar and organise your reply"
              >
                {isPolishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-900"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                title="Attach image or file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </>
          }
          trailingActions={
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-black hover:bg-gray-800 transition-all shadow-sm"
              onClick={handleSend}
              disabled={busy || !canSend}
              title={sendTitle}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </Button>
          }
        />
      </div>
      {!embedded && (
        <p className="text-[11px] text-gray-400 mt-1.5 px-1">
          Sparkles: AI polish · Paperclip: attach files (max 25 MB each)
        </p>
      )}
    </div>
  );
}
