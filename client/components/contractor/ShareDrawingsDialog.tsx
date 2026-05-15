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
import { Search, FileText, Check, Loader2 } from 'lucide-react';
import type { ContractorDrawing, ContractorShare } from '@/lib/contractor/types';

interface ShareDrawingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (drawingIds: string[]) => Promise<void>;
  allDrawings: ContractorDrawing[];
  alreadyShared: ContractorShare[];
  contractorName: string;
}

export function ShareDrawingsDialog({
  isOpen,
  onClose,
  onShare,
  allDrawings,
  alreadyShared,
  contractorName,
}: ShareDrawingsDialogProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const alreadySharedIds = useMemo(
    () => new Set(alreadyShared.map(s => s.item_id)),
    [alreadyShared]
  );

  const filteredDrawings = useMemo(() => {
    const search = searchText.toLowerCase().trim();
    if (!search) return allDrawings;
    return allDrawings.filter(
      drawing =>
        drawing.name.toLowerCase().includes(search) ||
        drawing.room?.toLowerCase().includes(search)
    );
  }, [allDrawings, searchText]);

  const availableDrawings = useMemo(
    () => filteredDrawings.filter(drawing => !alreadySharedIds.has(drawing.id)),
    [filteredDrawings, alreadySharedIds]
  );

  const toggleDrawing = (drawingId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(drawingId)) {
        next.delete(drawingId);
      } else {
        next.add(drawingId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === availableDrawings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableDrawings.map(d => d.id)));
    }
  };

  const handleShare = async () => {
    if (selectedIds.size === 0) return;
    setIsLoading(true);
    try {
      await onShare(Array.from(selectedIds));
      setSelectedIds(new Set());
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sage-600" />
            Share Drawings with {contractorName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search drawings..."
              className="pl-10"
            />
          </div>

          {/* Select All */}
          {availableDrawings.length > 0 && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-200">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Checkbox
                  checked={selectedIds.size === availableDrawings.length && availableDrawings.length > 0}
                  className="data-[state=checked]:bg-umber-900 data-[state=checked]:border-umber-900"
                />
                Select all ({availableDrawings.length})
              </button>
              {selectedIds.size > 0 && (
                <Badge className="bg-umber-100 text-umber-800">
                  {selectedIds.size} selected
                </Badge>
              )}
            </div>
          )}

          {/* Drawings List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredDrawings.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No drawings found
              </div>
            ) : (
              filteredDrawings.map(drawing => {
                const isShared = alreadySharedIds.has(drawing.id);
                const isSelected = selectedIds.has(drawing.id);

                return (
                  <div
                    key={drawing.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isShared
                        ? 'bg-sage-50 border-sage-200 opacity-60'
                        : isSelected
                        ? 'bg-umber-50 border-umber-300'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 cursor-pointer'
                    }`}
                    onClick={() => !isShared && toggleDrawing(drawing.id)}
                  >
                    <Checkbox
                      checked={isShared || isSelected}
                      disabled={isShared}
                      className="data-[state=checked]:bg-umber-900 data-[state=checked]:border-umber-900"
                    />
                    <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {drawing.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {drawing.room || 'General'} · {drawing.version}
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