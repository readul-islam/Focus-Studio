'use client';

import { PermissionGuard } from '@/components/PermissionGuard';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { gooeyToast as toast } from 'goey-toast';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

function NewPurchaseOrderContent() {
  const t = useTranslations('purchaseOrderEditorPage');
  const router = useRouter();
  const { user } = useUser();

  const { mutate: createPO, isPending } = usePost<{ id: number }>({
    onSuccess: (data) => {
      if (data?.id) {
        router.replace(`/finance/purchase-order/${data.id}`);
        return;
      }
      toast.error(t('toasts.createFailed'));
    },
    onError: () => toast.error(t('toasts.createFailed')),
  });

  useEffect(() => {
    if (!user?.studio?.id) return;
    createPO({
      url: 'finance/purchase-orders/',
      data: {
        status: 'DFT',
        studio: user.studio.id,
        currency: user.studio.default_currency || 'GBP',
        line_items: [],
      },
    });
  }, [user?.studio?.id]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        {t('creatingDraft')}
      </div>
    </div>
  );
}

export default function NewPurchaseOrderPage() {
  return (
    <PermissionGuard permission="finance.edit" redirectTo="/finance/purchase-order">
      <NewPurchaseOrderContent />
    </PermissionGuard>
  );
}
