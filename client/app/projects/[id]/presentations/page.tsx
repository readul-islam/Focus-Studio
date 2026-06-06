'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PresentationGallery } from '@/components/presentations/PresentationGallery';

export default function ProjectPresentationsPage() {
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    document.title = 'Project Presentations | Focuspilot';
  }, []);

  return (
    <PermissionGuard permission="presentations.view">
      <div className="p-6">
        <PresentationGallery projectId={projectId} />
      </div>
    </PermissionGuard>
  );
}
