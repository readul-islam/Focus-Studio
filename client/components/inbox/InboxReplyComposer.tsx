'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Paperclip, Send, X } from 'lucide-react';

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
};

export function InboxReplyComposer({
  replyBody,
  setReplyBody,
  onSend,
  isSending,
}: InboxReplyComposerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = Boolean(replyBody.trim() || files.length);

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

  const handleSend = () => {
    if (!canSend || isSending) return;
    onSend(files);
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white">
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

      <div className="flex gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all">
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-gray-500 hover:text-gray-900"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          title="Attach image or file"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Textarea
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder="Write a reply..."
          className="min-h-[60px] max-h-[200px] flex-1 focus:ring-offset-0 focus:ring-0 focus:border-none focus:outline-none border-0 focus-visible:ring-0 resize-none bg-transparent p-2 text-sm"
        />
        <div className="flex flex-col justify-center pb-1 pr-1">
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-black hover:bg-gray-800 transition-all shadow-sm"
            onClick={handleSend}
            disabled={isSending || !canSend}
            title="Send reply"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5 px-1">
        Attach images or files (max 25 MB each)
      </p>
    </div>
  );
}
