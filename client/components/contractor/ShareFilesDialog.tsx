'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Check, Loader2, File, ImageIcon, LinkIcon } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import type { ContractorShare } from '@/lib/contractor/types';
import { formatDistanceToNow } from 'date-fns';
import { gooeyToast as toast } from 'goey-toast';

interface ShareFilesDialogProps {
  projectId: string;
  contractorId: string;
  contractorName: string;
  isOpen: boolean;
  onClose: () => void;
  alreadyShared: ContractorShare[];
  onShareComplete: () => void;
}

function getFileIcon(type: string, name: string) {
  const extension = name.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

  if (type === 'LINK') {
    return <LinkIcon className="w-5 h-5 text-neutral-400" />;
  }
  if (imageExtensions.includes(extension)) {
    return <ImageIcon className="w-5 h-5 text-neutral-400" />;
  }
  if (extension === 'pdf') {
    return <FileText className="w-5 h-5 text-neutral-400" />;
  }
  return <File className="w-5 h-5 text-neutral-400" />;
}

export function ShareFilesDialog({
  projectId,
  contractorId,
  contractorName,
  isOpen,
  onClose,
  alreadyShared,
  onShareComplete,
}: ShareFilesDialogProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch project files
  const { data: filesResp, isLoading: filesLoading } = useFetch(
    isOpen ? `contractor_portal/project/${projectId}/shareable-documents/` : null,
    { enabled: isOpen }
  );

  const alreadySharedIds = useMemo(
    () => new Set(alreadyShared.map(s => s.item_id)),
    [alreadyShared]
  );

  // Filter out folders, only show files and links
  const allFiles = useMemo(() => {
    if (!filesResp) return [];
    return (filesResp as any[]).filter(f => f.type !== 'FOLDER');
  }, [filesResp]);

  const filteredFiles = useMemo(() => {
    const search = searchText.toLowerCase().trim();
    if (!search) return allFiles;
    return allFiles.filter(
      file => file.name?.toLowerCase().includes(search)
    );
  }, [allFiles, searchText]);

  const availableFiles = useMemo(
    () => filteredFiles.filter(file => !alreadySharedIds.has(String(file.id))),
    [filteredFiles, alreadySharedIds]
  );

  const toggleFile = (fileId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === availableFiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableFiles.map(file => String(file.id))));
    }
  };

  // Share documents mutation
  const { mutate: shareDocuments, isPending: isLoading } = usePost({
    onSuccess: (data: { created?: number; already_shared?: number }) => {
      const created = data?.created ?? selectedIds.size;
      const skipped = data?.already_shared ?? 0;
      let message = `Shared ${created} file${created === 1 ? '' : 's'} with ${contractorName}`;
      if (skipped > 0) {
        message += ` (${skipped} already shared)`;
      }
      toast.success(message);
      setSelectedIds(new Set());
      onShareComplete();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to share files');
    },
  });

  const handleShare = () => {
    if (selectedIds.size === 0) return;

    // Share each document via the bulk endpoint if available, otherwise individually
    const documentIds = Array.from(selectedIds).map(id => parseInt(id));

    shareDocuments({
      url: 'contractor_portal/bulk-share-documents/',
      data: {
        contractor_id: parseInt(contractorId),
        document_ids: documentIds,
        project_id: parseInt(projectId),
      },
    });
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sage-600" />
            Share Files with {contractorName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search files..."
              className="pl-10"
            />
          </div>

          {filesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : (
            <>
              {/* Select All */}
              {availableFiles.length > 0 && (
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-200">
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    <Checkbox
                      checked={selectedIds.size === availableFiles.length && availableFiles.length > 0}
                      className="data-[state=checked]:bg-umber-900 data-[state=checked]:border-umber-900"
                    />
                    Select all ({availableFiles.length})
                  </button>
                  {selectedIds.size > 0 && (
                    <Badge className="bg-umber-100 text-umber-800">
                      {selectedIds.size} selected
                    </Badge>
                  )}
                </div>
              )}

              {/* Files List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    {allFiles.length === 0 ? 'No files in this project' : 'No files match your search'}
                  </div>
                ) : (
                  filteredFiles.map(file => {
                    const isShared = alreadySharedIds.has(String(file.id));
                    const isSelected = selectedIds.has(String(file.id));

                    return (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isShared
                            ? 'bg-sage-50 border-sage-200 opacity-60'
                            : isSelected
                            ? 'bg-umber-50 border-umber-300'
                            : 'bg-white border-neutral-200 hover:border-neutral-300 cursor-pointer'
                        }`}
                        onClick={() => !isShared && toggleFile(String(file.id))}
                      >
                        <Checkbox
                          checked={isShared || isSelected}
                          disabled={isShared}
                          className="data-[state=checked]:bg-umber-900 data-[state=checked]:border-umber-900"
                        />
                        <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.type, file.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {file.updated_at
                              ? `Updated ${formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}`
                              : 'No date'}
                          </p>
                        </div>
                        {isShared && (
                          <Badge className="bg-sage-100 text-sage-700 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={selectedIds.size === 0 || isLoading}
            className="bg-umber-900 text-white hover:bg-umber-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>Share {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}