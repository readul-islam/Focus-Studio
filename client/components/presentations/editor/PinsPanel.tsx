'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, MapPin, ShoppingCart } from 'lucide-react';
import { usePresentationEditorStore } from '@/store/presentationEditorStore';
import type { PresentationPin } from '../types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  pins: PresentationPin[];
  onAddProductPin: () => void;
  onAddScenePin: () => void;
  onPinClick: (pin: PresentationPin) => void;
  onAddToProcurement?: (pin: PresentationPin) => void;
  canEdit: boolean;
};

export function PinsPanel({
  pins,
  onAddProductPin,
  onAddScenePin,
  onPinClick,
  onAddToProcurement,
  canEdit,
}: Props) {
  const t = useTranslations('presentationEditor');
  const { pinsPanelOpen, setPinsPanelOpen } = usePresentationEditorStore();

  const productPins = pins.filter((p) => p.pin_type === 'product');
  const scenePins = pins.filter((p) => p.pin_type === 'scene');

  if (!pinsPanelOpen) return null;

  return (
    <div className="w-72 border-l bg-background flex flex-col shrink-0">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium text-sm">{t('pinsPanel.title')}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPinsPanelOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="products" className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2">
          <TabsTrigger value="products" className="flex-1 text-xs">
            {t('pinsPanel.products')}
          </TabsTrigger>
          <TabsTrigger value="scenes" className="flex-1 text-xs">
            {t('pinsPanel.scenes', { count: scenePins.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="flex-1 overflow-y-auto p-3 space-y-2">
          {productPins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('pinsPanel.noProducts')}
            </p>
          ) : (
            productPins.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                onClick={() => onPinClick(pin)}
                onAddToProcurement={onAddToProcurement}
              />
            ))
          )}
          {canEdit && (
            <Button variant="outline" size="sm" className="w-full" onClick={onAddProductPin}>
              <MapPin className="mr-2 h-4 w-4" />
              {t('pinsPanel.addProductPin')}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="scenes" className="flex-1 overflow-y-auto p-3 space-y-2">
          {scenePins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('pinsPanel.noScenes')}
            </p>
          ) : (
            scenePins.map((pin) => (
              <PinCard key={pin.id} pin={pin} onClick={() => onPinClick(pin)} />
            ))
          )}
          {canEdit && (
            <Button variant="outline" size="sm" className="w-full" onClick={onAddScenePin}>
              <MapPin className="mr-2 h-4 w-4" />
              {t('pinsPanel.addScenePin')}
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PinCard({
  pin,
  onClick,
  onAddToProcurement,
}: {
  pin: PresentationPin;
  onClick: () => void;
  onAddToProcurement?: (pin: PresentationPin) => void;
}) {
  const t = useTranslations('presentationEditor');
  const imageUrl = pin.pin_type === 'product' ? pin.product_image_url : pin.scene_image_url;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 p-2 rounded border text-left hover:bg-muted/50 transition-colors'
      )}
    >
      <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {pin.label || pin.product_name || t('pinsPanel.unnamed')}
        </p>
        {pin.product_price != null && pin.show_pricing && (
          <p className="text-xs text-muted-foreground">${pin.product_price}</p>
        )}
      </div>
      {pin.pin_type === 'product' && onAddToProcurement && pin.product && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onAddToProcurement(pin);
          }}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </Button>
      )}
    </button>
  );
}
