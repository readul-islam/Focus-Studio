'use client';

import { useEffect } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PresentationGallery } from '@/components/presentations/PresentationGallery';

export default function PresentationsPage() {
  useEffect(() => {
    document.title = 'Presentations | Focuspilot';
  }, []);

  return (
    <PermissionGuard permission="presentations.view">
      <div className="p-6">
        <PresentationGallery />
      </div>
    </PermissionGuard>
  );
}
