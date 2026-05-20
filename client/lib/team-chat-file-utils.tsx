import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
  Presentation,
} from 'lucide-react';

export type ChatFileType = 'image' | 'video' | 'pdf' | 'document' | 'other';

export const MAX_CHAT_FILE_BYTES = 25 * 1024 * 1024;

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico']);
const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv', 'm4v']);
const PDF_EXT = new Set(['pdf']);
const DOC_EXT = new Set([
  'doc', 'docx', 'txt', 'rtf', 'odt',
  'xls', 'xlsx', 'csv', 'ods',
  'ppt', 'pptx', 'odp',
]);

export function extensionFromName(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function classifyChatFile(file: File): ChatFileType {
  const ext = extensionFromName(file.name);
  if (IMAGE_EXT.has(ext) || file.type.startsWith('image/')) return 'image';
  if (VIDEO_EXT.has(ext) || file.type.startsWith('video/')) return 'video';
  if (PDF_EXT.has(ext) || file.type === 'application/pdf') return 'pdf';
  if (DOC_EXT.has(ext)) return 'document';
  return 'other';
}

export function isAllowedChatFile(file: File): boolean {
  const ext = extensionFromName(file.name);
  if (IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext) || PDF_EXT.has(ext) || DOC_EXT.has(ext)) {
    return true;
  }
  return (
    file.type.startsWith('image/') ||
    file.type.startsWith('video/') ||
    file.type === 'application/pdf' ||
    file.type.includes('document') ||
    file.type.includes('spreadsheet') ||
    file.type.includes('presentation') ||
    file.type === 'text/plain'
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getChatFileIcon(
  fileType: ChatFileType,
  fileName: string,
  className = 'h-5 w-5'
) {
  const ext = extensionFromName(fileName);
  switch (fileType) {
    case 'image':
      return <FileImage className={className} aria-hidden />;
    case 'video':
      return <FileVideo className={className} aria-hidden />;
    case 'pdf':
      return <FileText className={className} aria-hidden />;
    case 'document':
      if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
        return <FileSpreadsheet className={className} aria-hidden />;
      }
      if (['ppt', 'pptx', 'odp'].includes(ext)) {
        return <Presentation className={className} aria-hidden />;
      }
      return <FileType className={className} aria-hidden />;
    default:
      return <File className={className} aria-hidden />;
  }
}
