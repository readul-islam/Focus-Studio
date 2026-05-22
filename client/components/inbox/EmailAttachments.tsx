'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/Api';
import { Download, FileImage, Loader2, Paperclip } from 'lucide-react';

export type EmailAttachmentMeta = {
  attachment_id: string;
  filename: string;
  mime_type: string;
  size?: number;
};

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentPath(emailId: number, attachmentId: string) {
  return `gmail/emails/${emailId}/attachments/${encodeURIComponent(attachmentId)}/`;
}

function AttachmentImage({
  emailId,
  attachment,
}: {
  emailId: number;
  attachment: EmailAttachmentMeta;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    api
      .get(attachmentPath(emailId, attachment.attachment_id), { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => setError(true));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [emailId, attachment.attachment_id]);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 p-2 border rounded-lg">
        <FileImage className="w-4 h-4 shrink-0" />
        {attachment.filename}
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex items-center justify-center w-full min-h-[8rem] max-w-md bg-stone-100 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <a
      href={src}
      download={attachment.filename}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block max-w-full"
    >
      <img
        src={src}
        alt={attachment.filename}
        className="max-w-full max-h-80 rounded-lg border border-gray-200 object-contain bg-white"
      />
    </a>
  );
}

export function EmailAttachments({
  emailId,
  attachments,
}: {
  emailId: number;
  attachments: EmailAttachmentMeta[];
}) {
  if (!attachments?.length) return null;

  const downloadOne = async (att: EmailAttachmentMeta) => {
    const res = await api.get(attachmentPath(emailId, att.attachment_id), {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = att.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Paperclip className="w-3 h-3" />
        {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
      </div>
      <div className="flex flex-col gap-3">
        {attachments.map((att) =>
          att.mime_type?.startsWith('image/') ? (
            <AttachmentImage
              key={att.attachment_id}
              emailId={emailId}
              attachment={att}
            />
          ) : (
            <button
              key={att.attachment_id}
              type="button"
              onClick={() => downloadOne(att)}
              className="flex items-center gap-2 text-xs text-gray-700 hover:bg-stone-50 border border-gray-200 rounded-lg px-3 py-2 w-fit transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{att.filename}</span>
              {att.size ? (
                <span className="text-gray-400">({formatSize(att.size)})</span>
              ) : null}
              <Download className="w-3.5 h-3.5 ml-1 shrink-0" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
