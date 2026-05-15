'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderIcon, ChevronRight, ChevronDown, Loader2, Home, FolderOutput } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { cn } from '@/lib/utils';

interface MoveDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (parentId: number | null) => Promise<void>;
  documentIds: (string | number)[];
  documentNames: string[];
  currentParentId: number | null;
  projectId: string;
  excludeFolderIds?: (string | number)[];
}

export function MoveDocumentDialog({
  isOpen,
  onClose,
  onConfirm,
  documentIds,
  documentNames,
  currentParentId,
  projectId,
  excludeFolderIds = [],
}: MoveDocumentDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<number | null | undefined>(undefined);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isMoving, setIsMoving] = useState(false);

  // Fetch root documents to get all root-level folders
  const { data: rootDocs, isLoading } = useFetch(
    isOpen ? `/documents/documents/root_documents/?project_id=${projectId}` : null,
    { enabled: isOpen }
  );

  // Filter to only folders
  const folders = useMemo(() => {
    if (!rootDocs) return [];
    return (rootDocs as any[]).filter(doc => doc.type === 'FOLDER');
  }, [rootDocs]);

  // Build disabled folder IDs set
  const disabledIds = useMemo(() => {
    const set = new Set<number>();
    excludeFolderIds.forEach(id => set.add(Number(id)));
    return set;
  }, [excludeFolderIds]);

  // Check if the move button should be disabled
  const isMoveDisabled = useMemo(() => {
    // Disabled if nothing selected
    if (selectedParentId === undefined) return true;
    // Disabled if selecting current location
    if (selectedParentId === currentParentId) return true;
    // Disabled if selecting a disabled folder
    if (selectedParentId !== null && disabledIds.has(selectedParentId)) return true;
    return false;
  }, [selectedParentId, currentParentId, disabledIds]);

  const handleMove = async () => {
    if (selectedParentId === undefined) return;
    setIsMoving(true);
    try {
      await onConfirm(selectedParentId);
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    setSelectedParentId(undefined);
    setExpandedFolders(new Set());
    onClose();
  };

  const toggleExpand = (folderId: number) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const itemLabel =
    documentNames.length === 1 ? documentNames[0] : `${documentNames.length} items`;

  const isCurrent = (id: number | null) => id === currentParentId;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl z-[999]" overlayClassName="z-[999]">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <FolderOutput className="w-5 h-5 " />
          </div>
          <div>
            <DialogTitle>Move Item</DialogTitle>
            {documentNames.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1 truncate max-w-[280px]">
                &quot;{itemLabel}&quot;
              </p>
            )}
          </div>
        </DialogHeader>

        <DialogDescription>
          Select a destination folder for your {documentNames.length === 1 ? 'item' : 'items'}.
        </DialogDescription>

        <ScrollArea className="h-[300px] border rounded-md p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : (
            <div className="space-y-1">
              {/* Root option */}
              <button
                onClick={() => setSelectedParentId(null)}
                disabled={isCurrent(null)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left',
                  selectedParentId === null ? 'bg-stone-100 text-gray-900' : 'hover:bg-stone-100',
                  isCurrent(null) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Home className="w-4 h-4" />
                <span>Root (Project Files)</span>
                {isCurrent(null) && <span className="text-xs text-gray-500 ml-auto">(current)</span>}
              </button>

              {/* Folder list */}
              {folders.map((folder: any) => (
                <FolderTreeItem
                  key={folder.id}
                  folder={folder}
                  level={0}
                  selectedId={selectedParentId ?? null}
                  onSelect={setSelectedParentId}
                  disabledIds={disabledIds}
                  currentParentId={currentParentId}
                  expandedIds={expandedFolders}
                  onToggleExpand={toggleExpand}
                />
              ))}

              {folders.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500 text-center py-4">No folders available</p>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4 flex gap-3 sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isMoving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isMoving || isMoveDisabled}>
            {isMoving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Moving...
              </>
            ) : (
              <>
                <FolderOutput className="w-4 h-4 mr-1" />
                Move
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Recursive folder tree item component
function FolderTreeItem({
  folder,
  level,
  selectedId,
  onSelect,
  disabledIds,
  currentParentId,
  expandedIds,
  onToggleExpand,
}: {
  folder: any;
  level: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
  disabledIds: Set<number>;
  currentParentId: number | null;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
}) {
  const isExpanded = expandedIds.has(folder.id);
  const isDisabled = disabledIds.has(folder.id);
  const isCurrent = currentParentId === folder.id;
  const isSelected = selectedId === folder.id;
  const hasChildren = folder.item_count > 0;

  // Fetch children when expanded
  const { data: childrenData, isLoading: childrenLoading } = useFetch(
    isExpanded ? `documents/documents/${folder.id}/folder_content/` : null,
    { enabled: isExpanded }
  );

  const childFolders = useMemo(() => {
    if (!childrenData) return [];
    return (childrenData as any[]).filter(doc => doc.type === 'FOLDER');
  }, [childrenData]);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md transition-colors',
          isSelected && !isDisabled && !isCurrent && 'bg-stone-100',
          (isDisabled || isCurrent) && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleExpand(folder.id);
          }}
          className="p-1  rounded flex-shrink-0"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 h-4 block" />
          )}
        </button>

        {/* Folder button */}
        <button
          onClick={() => !isDisabled && !isCurrent && onSelect(folder.id)}
          disabled={isDisabled || isCurrent}
          className={cn(
            'flex-1 flex items-center gap-2 py-2 px-3 text-sm text-left rounded',
            !isDisabled && !isCurrent && 'hover:bg-stone-100 cursor-pointer'
          )}
        >
          <FolderIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="truncate">{folder.name}</span>
          {isCurrent && <span className="text-xs text-gray-500 ml-auto flex-shrink-0">(current)</span>}
        </button>
      </div>

      {/* Children loading indicator */}
      {isExpanded && childrenLoading && (
        <div className="flex items-center gap-2 py-2" style={{ paddingLeft: `${(level + 1) * 16 + 32}px` }}>
          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
          <span className="text-xs text-gray-400">Loading...</span>
        </div>
      )}

      {/* Children */}
      {isExpanded &&
        !childrenLoading &&
        childFolders.map((child: any) => (
          <FolderTreeItem
            key={child.id}
            folder={child}
            level={level + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            disabledIds={disabledIds}
            currentParentId={currentParentId}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
          />
        ))}
    </div>
  );
}
