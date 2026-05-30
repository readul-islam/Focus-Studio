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
import { Search, Package, Check, Loader2 } from 'lucide-react';
import ProductImage from '@/components/project/ProductImage';
import type { ContractorProcurementItem, ContractorShare } from '@/lib/contractor/types';
import { useTranslations } from 'next-intl';

interface ShareItemsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (itemIds: string[]) => Promise<void>;
  allItems: ContractorProcurementItem[];
  alreadyShared: ContractorShare[];
  contractorName: string;
}

export function ShareItemsDialog({
  isOpen,
  onClose,
  onShare,
  allItems,
  alreadyShared,
  contractorName,
}: ShareItemsDialogProps) {
  const t = useTranslations('shareItemsDialog');
  const tc = useTranslations('common');
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const alreadySharedIds = useMemo(
    () => new Set(alreadyShared.map(s => s.item_id)),
    [alreadyShared]
  );

  const filteredItems = useMemo(() => {
    const search = searchText.toLowerCase().trim();
    if (!search) return allItems;
    return allItems.filter(
      item =>
        item.product_name.toLowerCase().includes(search) ||
        item.room.toLowerCase().includes(search)
    );
  }, [allItems, searchText]);

  const availableItems = useMemo(
    () => filteredItems.filter(item => !alreadySharedIds.has(item.id)),
    [filteredItems, alreadySharedIds]
  );

  const toggleItem = (itemId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === availableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableItems.map(item => item.id)));
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
            <Package className="w-5 h-5 text-slatex-600" />
            {t('title', { name: contractorName })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-10"
            />
          </div>

          {availableItems.length > 0 && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-200">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Checkbox
                  checked={selectedIds.size === availableItems.length && availableItems.length > 0}
                  className="data-[state=checked]:bg-umber-900 data-[state=checked]:border-umber-900"
                />
                {t('selectAll', { count: availableItems.length })}
              </button>
              {selectedIds.size > 0 && (
                <Badge className="bg-umber-100 text-umber-800">
                  {t('selectedCount', { count: selectedIds.size })}
                </Badge>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                {t('noItemsFound')}
              </div>
            ) : (
              filteredItems.map(item => {
                const isShared = alreadySharedIds.has(item.id);
                const isSelected = selectedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isShared
                        ? 'bg-sage-50 border-sage-200 opacity-60'
                        : isSelected
                        ? 'bg-umber-50 border-umber-300'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 cursor-pointer'
                    }`}
                    onClick={() => !isShared && toggleItem(item.id)}
                  >
                    <Checkbox
                      checked={isShared || isSelected}
                      disabled={isShared}
                      className="data-[state=checked]:bg-umber-900 data-[state=checked]:border-umber-900"
                    />
                    <ProductImage
                      src={item.product_image || ''}
                      alt={item.product_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-md object-cover bg-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {t('roomQty', { room: item.room, quantity: item.quantity })}
                      </p>
                    </div>
                    {isShared && (
                      <Badge className="bg-sage-100 text-sage-700 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        {t('sharedBadge')}
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
            {tc('cancel')}
          </Button>
          <Button
            onClick={handleShare}
            disabled={selectedIds.size === 0 || isLoading}
            className="bg-umber-900 text-white hover:bg-umber-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('sharing')}
              </>
            ) : selectedIds.size > 0 ? (
              t('shareCount', { count: selectedIds.size })
            ) : (
              t('share')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
