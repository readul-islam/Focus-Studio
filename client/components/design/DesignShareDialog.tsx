'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FolderOpen, Users, HardHat, Presentation } from 'lucide-react';
import { usePresentations } from '@/hooks/usePresentations';
import { postData } from '@/lib/Api';
import useFetch from '@/hooks/useFetch';
import { postFormData, fetchData } from '@/lib/Api';
import { createDocument } from '@/services/documentService';
import { urlToFile } from '@/hooks/useDesignSessions';
import { SelectContractorDialog } from '@/components/contractor/SelectContractorDialog';
import { gooeyToast as toast } from 'goey-toast';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type ProjectOption = {
  id: number;
  project_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  assetId: number;
  /** e.g. design-render.png or design-model.glb */
  downloadFilename?: string;
};

export function DesignShareDialog({
  open,
  onClose,
  fileUrl,
  assetId,
  downloadFilename = 'design-asset.png',
}: Props) {
  const t = useTranslations('designShareDialog');
  const [tab, setTab] = useState('project');
  const [projectId, setProjectId] = useState<string>('');
  const [teamMessage, setTeamMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedDocumentId, setAttachedDocumentId] = useState<number | null>(null);
  const [contractorDialogOpen, setContractorDialogOpen] = useState(false);
  const [presentationId, setPresentationId] = useState('');

  const { data: projectsRaw, isLoading: projectsLoading } = useFetch(
    open ? 'projects/user-projects/' : null
  );

  const { query: presentationsQuery } = usePresentations(
    projectId ? Number(projectId) : undefined
  );
  const presentations = presentationsQuery.data || [];

  const projects: ProjectOption[] = Array.isArray(projectsRaw)
    ? projectsRaw
    : Array.isArray((projectsRaw as { results?: ProjectOption[] })?.results)
      ? (projectsRaw as { results: ProjectOption[] }).results
      : [];

  const reset = () => {
    setProjectId('');
    setTeamMessage('');
    setAttachedDocumentId(null);
    setTab('project');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getFile = async () => urlToFile(fileUrl, downloadFilename, assetId);

  const handleAttachToProject = async () => {
    if (!projectId) {
      toast.error(t('toasts.selectProject'));
      return;
    }
    setIsSubmitting(true);
    try {
      const file = await getFile();
      const doc = await createDocument({
        name: file.name,
        type: 'FILE',
        file,
        project: projectId,
      });
      const docId = doc?.id ?? doc?.data?.id;
      if (docId) setAttachedDocumentId(Number(docId));
      toast.success(t('toasts.attached'));
    } catch {
      toast.error(t('toasts.attachFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareTeam = async () => {
    if (!projectId) {
      toast.error(t('toasts.selectProject'));
      return;
    }
    setIsSubmitting(true);
    try {
      const file = await getFile();
      const formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('content', teamMessage.trim() || t('defaultTeamMessage'));
      formData.append('files', file);
      await postFormData({ url: '/collaboration/messages/', data: formData });
      toast.success(t('toasts.sharedTeam'));
      handleClose();
    } catch {
      toast.error(t('toasts.shareTeamFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToPresentation = async () => {
    if (!presentationId) {
      toast.error(t('toasts.selectPresentation'));
      return;
    }
    setIsSubmitting(true);
    try {
      const pres = await fetchData(`/presentations/presentations/${presentationId}/`) as {
        slides?: { id: number }[];
      };
      const slideId = pres.slides?.[0]?.id;
      if (!slideId) throw new Error('No slide');
      await postData({
        url: '/presentations/pins/',
        data: {
          slide: slideId,
          pin_type: 'scene',
          design_asset: assetId,
          x: 200,
          y: 200,
          label: downloadFilename,
        },
      });
      toast.success(t('toasts.addedToPresentation'));
      handleClose();
    } catch {
      toast.error(t('toasts.addToPresentationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContractorShare = async () => {
    if (!projectId) {
      toast.error(t('toasts.selectProjectFirst'));
      return;
    }
    if (!attachedDocumentId) {
      setIsSubmitting(true);
      try {
        const file = await getFile();
        const doc = await createDocument({
          name: file.name,
          type: 'FILE',
          file,
          project: projectId,
        });
        const docId = doc?.id ?? doc?.data?.id;
        if (!docId) throw new Error('No document id');
        setAttachedDocumentId(Number(docId));
        setContractorDialogOpen(true);
      } catch {
        toast.error(t('toasts.attachBeforeContractor'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setContractorDialogOpen(true);
    }
  };

  const projectSelect = (
    <div className="space-y-2">
      <Label>{t('project')}</Label>
      <Select value={projectId} onValueChange={setProjectId} disabled={projectsLoading}>
        <SelectTrigger>
          <SelectValue placeholder={projectsLoading ? t('loading') : t('selectProject')} />
        </SelectTrigger>
        <SelectContent>
          {projects.map(p => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.project_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={v => !v && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="project" className="text-xs gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                {t('tabs.project')}
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs gap-1">
                <Users className="w-3.5 h-3.5" />
                {t('tabs.team')}
              </TabsTrigger>
              <TabsTrigger value="contractor" className="text-xs gap-1">
                <HardHat className="w-3.5 h-3.5" />
                {t('tabs.contractor')}
              </TabsTrigger>
              <TabsTrigger value="presentation" className="text-xs gap-1">
                <Presentation className="w-3.5 h-3.5" />
                {t('tabs.presentation')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="project" className="space-y-4 mt-4">
              {projectSelect}
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={handleAttachToProject}
                disabled={isSubmitting || !projectId}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('attachToProject')}
              </Button>
              {attachedDocumentId && projectId && (
                <p className="text-xs text-gray-500 text-center">
                  {t('attached')}{' '}
                  <Link
                    href={`/projects/${projectId}/docs`}
                    className="text-sage-700 underline"
                    onClick={handleClose}
                  >
                    {t('viewInFiles')}
                  </Link>
                </p>
              )}
            </TabsContent>
            <TabsContent value="team" className="space-y-4 mt-4">
              {projectSelect}
              <div className="space-y-2">
                <Label>{t('messageOptional')}</Label>
                <Input
                  value={teamMessage}
                  onChange={e => setTeamMessage(e.target.value)}
                  placeholder={t('messagePlaceholder')}
                />
              </div>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={handleShareTeam}
                disabled={isSubmitting || !projectId}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('postToTeam')}
              </Button>
            </TabsContent>
            <TabsContent value="contractor" className="space-y-4 mt-4">
              {projectSelect}
              <p className="text-xs text-gray-500">
                {t('contractorDesc')}
              </p>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={handleOpenContractorShare}
                disabled={isSubmitting || !projectId}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('shareWithContractor')}
              </Button>
            </TabsContent>
            <TabsContent value="presentation" className="space-y-4 mt-4">
              {projectSelect}
              <div className="space-y-2">
                <Label>{t('presentation')}</Label>
                <Select value={presentationId} onValueChange={setPresentationId} disabled={!projectId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPresentation')} />
                  </SelectTrigger>
                  <SelectContent>
                    {presentations.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500">{t('presentationDesc')}</p>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={handleAddToPresentation}
                disabled={isSubmitting || !presentationId}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('addToPresentation')}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {projectId && attachedDocumentId && (
        <SelectContractorDialog
          projectId={projectId}
          isOpen={contractorDialogOpen}
          onClose={() => setContractorDialogOpen(false)}
          onSelect={() => {
            setContractorDialogOpen(false);
            handleClose();
          }}
          documentId={attachedDocumentId}
          title={t('contractorDialogTitle')}
        />
      )}
    </>
  );
}
