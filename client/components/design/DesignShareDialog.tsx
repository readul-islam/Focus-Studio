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
import { Loader2, FolderOpen, Users, HardHat } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { postFormData } from '@/lib/Api';
import { createDocument } from '@/services/documentService';
import { urlToFile } from '@/hooks/useDesignSessions';
import { SelectContractorDialog } from '@/components/contractor/SelectContractorDialog';
import { gooeyToast as toast } from 'goey-toast';
import Link from 'next/link';

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
  const [tab, setTab] = useState('project');
  const [projectId, setProjectId] = useState<string>('');
  const [teamMessage, setTeamMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedDocumentId, setAttachedDocumentId] = useState<number | null>(null);
  const [contractorDialogOpen, setContractorDialogOpen] = useState(false);

  const { data: projectsRaw, isLoading: projectsLoading } = useFetch(
    open ? 'projects/user-projects/' : null
  );

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
      toast.error('Select a project');
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
      toast.success('Design attached to project Files');
    } catch {
      toast.error('Failed to attach design to project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareTeam = async () => {
    if (!projectId) {
      toast.error('Select a project');
      return;
    }
    setIsSubmitting(true);
    try {
      const file = await getFile();
      const formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('content', teamMessage.trim() || 'Shared a design render from Design Studio');
      formData.append('files', file);
      await postFormData({ url: '/collaboration/messages/', data: formData });
      toast.success('Shared with project team');
      handleClose();
    } catch {
      toast.error('Failed to share with team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContractorShare = async () => {
    if (!projectId) {
      toast.error('Select a project first');
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
        toast.error('Attach to project before sharing with contractor');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setContractorDialogOpen(true);
    }
  };

  const projectSelect = (
    <div className="space-y-2">
      <Label>Project</Label>
      <Select value={projectId} onValueChange={setProjectId} disabled={projectsLoading}>
        <SelectTrigger>
          <SelectValue placeholder={projectsLoading ? 'Loading…' : 'Select project'} />
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
            <DialogTitle>Share design</DialogTitle>
          </DialogHeader>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="project" className="text-xs gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                Project
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs gap-1">
                <Users className="w-3.5 h-3.5" />
                Team
              </TabsTrigger>
              <TabsTrigger value="contractor" className="text-xs gap-1">
                <HardHat className="w-3.5 h-3.5" />
                Contractor
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
                Attach to project Files
              </Button>
              {attachedDocumentId && projectId && (
                <p className="text-xs text-gray-500 text-center">
                  Attached.{' '}
                  <Link
                    href={`/projects/${projectId}/docs`}
                    className="text-sage-700 underline"
                    onClick={handleClose}
                  >
                    View in Files
                  </Link>
                </p>
              )}
            </TabsContent>
            <TabsContent value="team" className="space-y-4 mt-4">
              {projectSelect}
              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Input
                  value={teamMessage}
                  onChange={e => setTeamMessage(e.target.value)}
                  placeholder="Check out this design concept…"
                />
              </div>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={handleShareTeam}
                disabled={isSubmitting || !projectId}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Post to team chat
              </Button>
            </TabsContent>
            <TabsContent value="contractor" className="space-y-4 mt-4">
              {projectSelect}
              <p className="text-xs text-gray-500">
                The design will be saved to project Files, then shared with a contractor on that project.
              </p>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={handleOpenContractorShare}
                disabled={isSubmitting || !projectId}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Share with contractor
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
          title="Share design with contractor"
        />
      )}
    </>
  );
}
