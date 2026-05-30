import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { Button } from '@/components/ui/button';
import { Eye, Paperclip, Trash2, X } from 'lucide-react';
import { Input } from '../ui/input';
import { DeleteDialog } from '../DeleteDialog';
import { deleteData, fetchData, postFormData } from '@/lib/Api';
import { useTranslations } from 'next-intl';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type TaskAttachmentItem = {
  id: number;
  name: string;
  file_name?: string;
  file_url?: string;
  created_at: string;
  metadata?: { mimetype?: string; size?: number };
};

type AttachmentsProps = {
  taskId?: number | null;
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
  onUploadComplete?: () => void;
};

async function uploadTaskFiles(taskId: number, files: File[]) {
  const form = new FormData();
  files.forEach(file => form.append('files', file));
  return postFormData({ url: `task/tasks/${taskId}/attachments/`, data: form });
}

const Attachments = ({
  taskId,
  pendingFiles = [],
  onPendingFilesChange,
  onUploadComplete,
}: AttachmentsProps) => {
  const t = useTranslations('taskAttachments');
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletedFile, setDeletedFile] = useState<TaskAttachmentItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: serverFiles = [], isLoading } = useQuery<TaskAttachmentItem[]>({
    queryKey: ['task-attachments', taskId],
    queryFn: () => fetchData(`task/tasks/${taskId}/attachments/`),
    enabled: Boolean(taskId),
  });

  const refetchAttachments = useCallback(() => {
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
    }
  }, [queryClient, taskId]);

  const handleModalOpen = (file: TaskAttachmentItem) => {
    setDeletedFile(file);
    setIsDeleteOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!deletedFile?.id) return;
    try {
      await deleteData({ url: `task/attachments/${deletedFile.id}/` });
      toast.success(t('toasts.removed'));
      refetchAttachments();
      onUploadComplete?.();
    } catch {
      toast.error(t('toasts.deleteFailed'));
    } finally {
      setIsDeleteOpen(false);
      setDeletedFile(null);
    }
  };

  const uploadToTask = useCallback(
    async (id: number, files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      try {
        await uploadTaskFiles(id, files);
        toast.success(files.length > 1 ? t('toasts.uploadedPlural') : t('toasts.uploaded'));
        refetchAttachments();
        onUploadComplete?.();
      } catch {
        toast.error(t('toasts.uploadFailed'));
        throw new Error('upload failed');
      } finally {
        setUploading(false);
      }
    },
    [refetchAttachments, onUploadComplete, t]
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) return;

    const valid: File[] = [];
    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(t('toasts.fileTooLarge', { name: f.name }));
        continue;
      }
      valid.push(f);
    }
    if (!valid.length) return;

    if (taskId) {
      await uploadToTask(taskId, valid);
      return;
    }

    onPendingFilesChange?.([...pendingFiles, ...valid]);
  };

  const removePendingFile = (index: number) => {
    onPendingFilesChange?.(pendingFiles.filter((_, i) => i !== index));
  };

  const displayFiles = serverFiles;
  const showPending = !taskId && pendingFiles.length > 0;

  return (
    <div className="">
      <div className="list my-10 flex flex-col gap-4">
        {isLoading && taskId ? (
          <p className="text-xs text-[#8A9099]">{t('loading')}</p>
        ) : null}

        {displayFiles?.map((item, i) => {
          const name = item.name || item.file_name || t('defaultFileName');
          const url = item.file_url || '';
          const mimetype = item.metadata?.mimetype || '';
          const isImage = mimetype.includes('image');
          return (
            <div key={item.id ?? i} className="item flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="img-box overflow-hidden border flex items-center justify-center h-[74px] w-[74px] rounded-2xl">
                  {isImage && url ? (
                    <img className="w-full h-full object-cover" src={url} alt={name} />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="35"
                      height="35"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8A9099"
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-file"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="title text-sm font-medium text-[#17181B]">{name}</div>
                  <div className="title text-xs font-normal text-[#8A9099] mt-1">
                    {t('uploadedOn', { date: new Date(item.created_at).toLocaleString() })}
                  </div>
                  {item.metadata?.size ? (
                    <div className="title text-xs font-normal text-[#8A9099] mt-1">
                      {(item.metadata.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {url ? (
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 px-4" asChild>
                    <a href={url} download={name} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </a>
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-stone-100"
                  onClick={() => handleModalOpen(item)}
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>
          );
        })}

        {showPending &&
          pendingFiles.map((file, i) => (
            <div
              key={`pending-${file.name}-${i}`}
              className="item flex items-center justify-between gap-2 flex-wrap border border-dashed border-stone-200 rounded-xl px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Paperclip className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-[#17181B]">{file.name}</div>
                  <div className="text-xs text-[#8A9099]">
                    {t('pendingHint', { size: (file.size / (1024 * 1024)).toFixed(2) })}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removePendingFile(i)}>
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-[130px_1fr] gap-4 items-start">
        <div className="flex items-center gap-2 text-[13px] text-gray-600 self-start pt-1">
          <span className="text-gray-500">
            <Paperclip className="h-4 w-4" />
          </span>
          <span className="truncate">{t('label')}</span>
        </div>

        <div className="item flex items-center justify-between gap-2 flex-wrap cursor-pointer">
          <div className="flex w-full justify-between items-center">
            <Input
              id="task-attachment-files"
              type="file"
              multiple
              disabled={uploading}
              onChange={handleFileChange}
              className="bg-white w-full h-9 text-sm rounded-xl"
            />
          </div>
          {!taskId ? (
            <p className="text-xs text-[#8A9099] w-full mt-1">
              {t('saveHint')}
            </p>
          ) : null}
        </div>
      </div>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteFile}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        itemName={deletedFile?.name || deletedFile?.file_name}
        requireConfirmation={false}
      />
    </div>
  );
};

export { uploadTaskFiles };
export default Attachments;
