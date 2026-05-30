'use client';

import { PermissionGuard } from '@/components/PermissionGuard';
import { LibraryNav } from '@/components/library-nav';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

function MaterialsPageContent() {
  const t = useTranslations('libraryMaterialsPage');

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0 space-y-6">
        <LibraryNav />

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🧱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('title')}</h3>
            <p className="text-gray-600 mb-6">{t('subtitle')}</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t('addMaterial')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <PermissionGuard permission="library.view" redirectTo="/">
      <MaterialsPageContent />
    </PermissionGuard>
  );
}
