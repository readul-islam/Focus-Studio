'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Loader2 } from 'lucide-react';
import type { Presentation } from './types';
import { gooeyToast as toast } from 'goey-toast';
import { useTranslations } from 'next-intl';

type Props = {
  open: boolean;
  onClose: () => void;
  presentation: Presentation | null;
  onPublish: (data: {
    client_dashboard_published?: boolean;
    web_published?: boolean;
    show_product_pricing?: boolean;
    show_supplier_info?: boolean;
  }) => void;
  isSubmitting?: boolean;
};

export function SharePresentationDialog({
  open,
  onClose,
  presentation,
  onPublish,
  isSubmitting,
}: Props) {
  const t = useTranslations('presentationEditor');
  const [clientDashboard, setClientDashboard] = useState(false);
  const [webPublished, setWebPublished] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showSupplier, setShowSupplier] = useState(false);

  useEffect(() => {
    if (presentation) {
      setClientDashboard(presentation.client_dashboard_published);
      setWebPublished(presentation.web_published);
      setShowPricing(presentation.show_product_pricing);
      setShowSupplier(presentation.show_supplier_info);
    }
  }, [presentation]);

  const publicUrl =
    presentation?.public_token && typeof window !== 'undefined'
      ? `${window.location.origin}/p/presentations/${presentation.public_token}`
      : '';

  const handleSave = () => {
    onPublish({
      client_dashboard_published: clientDashboard,
      web_published: webPublished,
      show_product_pricing: showPricing,
      show_supplier_info: showSupplier,
    });
  };

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast.success(t('share.copied'));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('share.title')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t('share.description')}</p>

        <div className="space-y-4 py-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label>{t('share.clientDashboard')}</Label>
              <p className="text-xs text-muted-foreground mt-1">{t('share.clientDashboardDesc')}</p>
            </div>
            <Switch checked={clientDashboard} onCheckedChange={setClientDashboard} />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <Label>{t('share.webPublish')}</Label>
              <p className="text-xs text-muted-foreground mt-1">{t('share.webPublishDesc')}</p>
            </div>
            <Switch checked={webPublished} onCheckedChange={setWebPublished} />
          </div>

          {webPublished && publicUrl && (
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('share.showPricing')}</Label>
              <Switch checked={showPricing} onCheckedChange={setShowPricing} />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('share.showSupplier')}</Label>
              <Switch checked={showSupplier} onCheckedChange={setShowSupplier} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>{t('share.cancel')}</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('share.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
