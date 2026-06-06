'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PresentationEditor } from '@/components/presentations/editor/PresentationEditor';

export default function PresentationEditorPage() {
  const params = useParams();
  const id = Number(params.id);

  useEffect(() => {
    document.title = 'Presentation Editor | Focuspilot';
  }, []);

  return (
    <PermissionGuard permission="presentations.view">
      <PresentationEditor presentationId={id} />
    </PermissionGuard>
  );
}
