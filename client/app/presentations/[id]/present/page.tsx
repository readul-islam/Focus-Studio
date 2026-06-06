'use client';

import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PresentationPresentMode } from '@/components/presentations/editor/PresentationPresentMode';

export default function PresentationPresentPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <PermissionGuard permission="presentations.view">
      <PresentationPresentMode presentationId={id} />
    </PermissionGuard>
  );
}
