'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useFetch from '@/hooks/useFetch';
import { fetchData } from '@/lib/Api';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  PresentationTemplatePicker,
  type PresentationTemplateMeta,
} from './PresentationTemplatePicker';

type ProjectOption = { id: number; project_name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; project: number; template_id?: string }) => void;
  isSubmitting?: boolean;
  defaultProjectId?: number;
};

export function CreatePresentationDialog({
  open,
  onClose,
  onCreate,
  isSubmitting,
  defaultProjectId,
}: Props) {
  const t = useTranslations('presentationsPage');
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('blank');
  const [templates, setTemplates] = useState<PresentationTemplateMeta[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [projectId, setProjectId] = useState<string>(
    defaultProjectId ? String(defaultProjectId) : ''
  );

  const { data: projectsRaw, isLoading } = useFetch(open ? 'projects/user-projects/' : null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setTemplatesLoading(true);
    fetchData('/presentations/presentations/templates/')
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setTemplates(data as PresentationTemplateMeta[]);
        }
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setTemplatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);
  const projects: ProjectOption[] = Array.isArray(projectsRaw)
    ? projectsRaw
    : Array.isArray((projectsRaw as { results?: ProjectOption[] })?.results)
      ? (projectsRaw as { results: ProjectOption[] }).results
      : [];

  const handleSubmit = () => {
    if (!title.trim() || !projectId) return;
    onCreate({
      title: title.trim(),
      project: Number(projectId),
      template_id: templateId || 'blank',
    });
  };

  const handleClose = () => {
    setTitle('');
    setTemplateId('blank');
    if (!defaultProjectId) setProjectId('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pres-title">{t('createDialog.nameLabel')}</Label>
            <Input
              id="pres-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('createDialog.namePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('createDialog.projectLabel')}</Label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
              disabled={!!defaultProjectId || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('createDialog.projectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PresentationTemplatePicker
            templates={templates}
            value={templateId}
            onChange={setTemplateId}
            isLoading={templatesLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('createDialog.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !projectId || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
