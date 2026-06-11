'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2 } from 'lucide-react';
import { PresentationCard } from './PresentationCard';
import { CreatePresentationDialog } from './CreatePresentationDialog';
import { usePresentations } from '@/hooks/usePresentations';
import { usePermissions } from '@/hooks/usePermissions';
import { gooeyToast as toast } from 'goey-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Presentation } from './types';
import { useTranslations } from 'next-intl';

type Props = {
  projectId?: string;
};

export function PresentationGallery({ projectId }: Props) {
  const t = useTranslations('presentationsPage');
  const router = useRouter();
  const { can } = usePermissions();
  const canEdit = can('presentations.edit');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Presentation | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const {
    query,
    createPresentation,
    updatePresentation,
    deletePresentation,
    duplicatePresentation,
  } = usePresentations(projectId, search);

  const presentations = query.data || [];

  const handleCreate = (data: { title: string; project: number; template_id?: string }) => {
    createPresentation.mutate(data, {
      onSuccess: (created) => {
        setCreateOpen(false);
        toast.success(t('toasts.created'));
        router.push(`/presentations/${created.id}`);
      },
      onError: () => toast.error(t('toasts.createFailed')),
    });
  };

  const handleRename = () => {
    if (!renameTarget || !renameTitle.trim()) return;
    updatePresentation.mutate(
      { id: renameTarget.id, title: renameTitle.trim() },
      {
        onSuccess: () => {
          setRenameTarget(null);
          toast.success(t('toasts.renamed'));
        },
        onError: () => toast.error(t('toasts.renameFailed')),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9"
            />
          </div>
          {canEdit && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createButton')}
            </Button>
          )}
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : presentations.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">{t('empty')}</p>
          {canEdit && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createButton')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {presentations.map((p) => (
            <PresentationCard
              key={p.id}
              presentation={p}
              canEdit={canEdit}
              onRename={(pres) => {
                setRenameTarget(pres);
                setRenameTitle(pres.title);
              }}
              onDuplicate={(id) =>
                duplicatePresentation.mutate(id, {
                  onSuccess: () => toast.success(t('toasts.duplicated')),
                  onError: () => toast.error(t('toasts.duplicateFailed')),
                })
              }
              onDelete={(id) =>
                deletePresentation.mutate(id, {
                  onSuccess: () => toast.success(t('toasts.deleted')),
                  onError: () => toast.error(t('toasts.deleteFailed')),
                })
              }
            />
          ))}
        </div>
      )}

      <CreatePresentationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        isSubmitting={createPresentation.isPending}
        defaultProjectId={projectId ? Number(projectId) : undefined}
      />

      <Dialog open={!!renameTarget} onOpenChange={(v) => !v && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('renameDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>{t('renameDialog.label')}</Label>
            <Input value={renameTitle} onChange={(e) => setRenameTitle(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              {t('renameDialog.cancel')}
            </Button>
            <Button onClick={handleRename} disabled={updatePresentation.isPending}>
              {t('renameDialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
