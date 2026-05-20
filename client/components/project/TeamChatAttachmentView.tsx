'use client';

import { useState } from 'react';
import { Download, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatFileSize,
  getChatFileIcon,
  type ChatFileType,
} from '@/lib/team-chat-file-utils';

export type TeamChatAttachment = {
  id: number;
  file_name: string;
  file_size: number;
  content_type: string;
  file_type: ChatFileType;
  file_url: string | null;
};

export function TeamChatAttachmentView({
  attachment,
  isOwn,
}: {
  attachment: TeamChatAttachment;
  isOwn: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const { file_type, file_name, file_url, file_size } = attachment;

  if (!file_url) return null;

  const iconClass = cn('h-5 w-5 flex-shrink-0', isOwn ? 'text-[#F2C744]' : 'text-neutral-500');
  const linkClass = cn(
    'text-sm font-medium underline-offset-2 hover:underline truncate',
    isOwn ? 'text-white' : 'text-neutral-900'
  );
  const metaClass = cn('text-xs', isOwn ? 'text-white/70' : 'text-neutral-500');

  if (file_type === 'image' && !imgError) {
    return (
      <a
        href={file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 max-w-xs"
      >
        <img
          src={file_url}
          alt={file_name}
          className="rounded-lg max-h-56 w-auto object-cover border border-black/10"
          onError={() => setImgError(true)}
        />
        <p className={cn('mt-1 truncate', metaClass)}>{file_name}</p>
      </a>
    );
  }

  if (file_type === 'video') {
    return (
      <div className="mt-2 max-w-sm">
        <video
          src={file_url}
          controls
          className="rounded-lg max-h-56 w-full bg-black/20"
          preload="metadata"
        >
          <track kind="captions" />
        </video>
        <a
          href={file_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('mt-1 flex items-center gap-1', linkClass)}
        >
          <Play className="h-3.5 w-3.5" />
          {file_name}
        </a>
      </div>
    );
  }

  return (
    <a
      href={file_url}
      target="_blank"
      rel="noopener noreferrer"
      download={file_name}
      className={cn(
        'mt-2 flex items-center gap-3 rounded-lg border px-3 py-2.5 max-w-xs transition-colors',
        isOwn
          ? 'border-white/20 bg-white/10 hover:bg-white/15'
          : 'border-neutral-200 bg-white hover:bg-stone-50'
      )}
    >
      {getChatFileIcon(file_type, file_name, iconClass)}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-medium text-sm', isOwn ? 'text-white' : 'text-neutral-900')}>
          {file_name}
        </p>
        <p className={metaClass}>{formatFileSize(file_size)}</p>
      </div>
      <Download className={cn('h-4 w-4 flex-shrink-0', isOwn ? 'text-white/80' : 'text-neutral-400')} />
    </a>
  );
}
