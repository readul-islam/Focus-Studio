'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { usePresentation } from '@/hooks/usePresentations';
import { usePresentationSlides } from '@/hooks/usePresentationSlides';
import { usePresentationPins } from '@/hooks/usePresentationPins';
import { usePresentationEditorStore } from '@/store/presentationEditorStore';
import { EditorToolbar } from './EditorToolbar';
import { SlideNavigator } from './SlideNavigator';
import { AddElementMenu } from './AddElementMenu';
import { PinsPanel } from './PinsPanel';
import { AssetPickerDialog } from './AssetPickerDialog';
import { SharePresentationDialog } from '../SharePresentationDialog';
import { usePresentations } from '@/hooks/usePresentations';
import { usePermissions } from '@/hooks/usePermissions';
import { gooeyToast as toast } from 'goey-toast';
import type { CanvasElement, PresentationPin } from '../types';
import { useTranslations } from 'next-intl';
import { AddToProjectDialog } from '@/components/product/AddToProjectDialog';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { getProductImageUrl } from './presentationAssets';
import {
  createImageElement,
  createShapeElement,
  createTextElement,
  newElementId,
} from './canvasElementFactory';
import {
  fitImageToSlide,
  getImageDimensions,
  readImageFileAsDataUrl,
} from './canvasFileDrop';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../types';

const PresentationCanvas = dynamic(
  () => import('./PresentationCanvas').then((m) => m.PresentationCanvas),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

type Props = {
  presentationId: number;
};

export function PresentationEditor({ presentationId }: Props) {
  const t = useTranslations('presentationEditor');
  const { can } = usePermissions();
  const canEdit = can('presentations.edit');
  const canShare = can('presentations.share');

  const { data: presentation, isLoading } = usePresentation(presentationId);
  const { publishPresentation } = usePresentations();
  const {
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    setSlideBackgroundSrc,
    clearSlideBackground,
    invalidate,
  } = usePresentationSlides(presentationId);
  const { query: pinsQuery, createPin } = usePresentationPins(presentationId);

  const {
    slides,
    activeSlideId,
    isDirty,
    pinMode,
    setSlides,
    setDirty,
    setPinMode,
    setActiveSlideId,
    setSelectedElementId,
    selectedElementId,
    updateSlideCanvas,
    updateSlideMeta,
    requestTextEdit,
    reset,
  } = usePresentationEditorStore();

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const [shareOpen, setShareOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerMode, setAssetPickerMode] = useState<'image' | 'product' | 'scene' | 'pin-product' | 'pin-scene'>('image');
  const [pendingPinPos, setPendingPinPos] = useState<{ x: number; y: number } | null>(null);
  const [procurementPin, setProcurementPin] = useState<PresentationPin | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);
  const { user } = useUser();
  const procurementMutation = usePost();

  useEffect(() => {
    hydratedRef.current = false;
    return () => reset();
  }, [presentationId, reset]);

  useEffect(() => {
    if (!presentation?.slides) return;

    if (!hydratedRef.current) {
      setSlides(presentation.slides.map((s) => ({
        ...s,
        canvas_data: Array.isArray(s.canvas_data) ? s.canvas_data : [],
      })));
      hydratedRef.current = true;
      return;
    }

    const localSlides = usePresentationEditorStore.getState().slides;
    const serverIds = presentation.slides.map((s) => s.id).join(',');
    const localIds = localSlides.map((s) => s.id).join(',');
    if (serverIds === localIds) return;

    const merged = presentation.slides.map((serverSlide) => {
      const local = localSlides.find((s) => s.id === serverSlide.id);
      return local
        ? { ...serverSlide, canvas_data: local.canvas_data }
        : { ...serverSlide, canvas_data: Array.isArray(serverSlide.canvas_data) ? serverSlide.canvas_data : [] };
    });
    setSlides(merged);
  }, [presentation?.slides, setSlides]);

  useEffect(() => {
    if (!isDirty || !canEdit) {
      if (!isDirty) setSaveStatus('saved');
      return;
    }
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const slide = slides.find((s) => s.id === activeSlideId);
      if (!slide) return;
      setSaveStatus('saving');
      updateSlide.mutate(
        { id: slide.id, canvas_data: slide.canvas_data, background_color: slide.background_color, title: slide.title },
        {
          onSuccess: () => {
            setDirty(false);
            setSaveStatus('saved');
          },
          onError: () => {
            setSaveStatus('unsaved');
            toast.error(t('toasts.saveFailed'));
          },
        }
      );
    }, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isDirty, slides, activeSlideId, canEdit, updateSlide, setDirty, t]);

  const addElementToCanvas = useCallback((element: CanvasElement) => {
    if (!activeSlideId) {
      toast.error(t('toasts.noActiveSlide'));
      return false;
    }
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) {
      toast.error(t('toasts.noActiveSlide'));
      return false;
    }
    const maxZ = slide.canvas_data.reduce((m, e) => Math.max(m, e.z), 0);
    const next = { ...element, z: maxZ + 1 };
    updateSlideCanvas(slide.id, [...slide.canvas_data, next]);
    setSelectedElementId(next.id);
    return true;
  }, [slides, activeSlideId, updateSlideCanvas, setSelectedElementId, t]);

  const handleAddSlide = () => {
    createSlide.mutate(
      { presentation: presentationId, title: t('slide.defaultTitle', { n: slides.length + 1 }) },
      {
        onSuccess: (slide) => {
          setSlides([
            ...slides,
            {
              ...slide,
              canvas_data: Array.isArray(slide.canvas_data) ? slide.canvas_data : [],
            },
          ]);
          setActiveSlideId(slide.id);
        },
      }
    );
  };

  const handleDeleteSlide = (id: number) => {
    if (slides.length <= 1) {
      toast.error(t('toasts.lastSlide'));
      return;
    }
    deleteSlide.mutate(id, {
      onSuccess: () => {
        const remaining = slides.filter((s) => s.id !== id);
        setSlides(remaining);
        if (activeSlideId === id) {
          setActiveSlideId(remaining[0]?.id ?? null);
        }
      },
    });
  };

  const handleDuplicateSlide = (id: number) => {
    const slide = slides.find((s) => s.id === id);
    if (!slide) return;
    createSlide.mutate(
      { presentation: presentationId, title: `${slide.title} (Copy)` },
      {
        onSuccess: (newSlide) => {
          const duplicated = {
            ...newSlide,
            canvas_data: [...slide.canvas_data],
            background_color: slide.background_color,
          };
          setSlides([...slides, duplicated]);
          setActiveSlideId(newSlide.id);
          updateSlide.mutate({
            id: newSlide.id,
            canvas_data: duplicated.canvas_data,
            background_color: duplicated.background_color,
          });
        },
      }
    );
  };

  const handleBackgroundColorChange = useCallback(
    (slideId: number, color: string) => {
      updateSlideMeta(slideId, { background_color: color });
      updateSlide.mutate(
        { id: slideId, background_color: color },
        { onError: () => toast.error(t('toasts.saveFailed')) }
      );
    },
    [updateSlideMeta, updateSlide, t]
  );

  const handleApplyTheme = useCallback(
    (color: string) => {
      if (!activeSlideId) return;
      handleBackgroundColorChange(activeSlideId, color);
    },
    [activeSlideId, handleBackgroundColorChange]
  );

  const handleQuickAddText = useCallback(() => {
    const element = createTextElement();
    if (!addElementToCanvas(element)) return;
    requestTextEdit(element.id);
  }, [addElementToCanvas, requestTextEdit]);

  const handleQuickAddShape = useCallback(() => {
    addElementToCanvas(createShapeElement());
  }, [addElementToCanvas]);

  const triggerImageUpload = useCallback(() => {
    imageUploadRef.current?.click();
  }, []);

  const handleDropImageFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      try {
        const dataUrl = await readImageFileAsDataUrl(file);
        const dims = await getImageDimensions(dataUrl);
        const layout = fitImageToSlide(dims.width, dims.height, SLIDE_WIDTH, SLIDE_HEIGHT);
        const added = addElementToCanvas(
          createImageElement(dataUrl, layout, file.name)
        );
        if (added) toast.success(t('toasts.imageAdded'));
      } catch (err) {
        const code = err instanceof Error ? err.message : '';
        if (code === 'too_large') toast.error(t('toasts.imageTooLarge'));
        else if (code === 'unsupported') toast.error(t('toasts.unsupportedFile'));
        else toast.error(t('toasts.imageAddFailed'));
      }
    },
    [addElementToCanvas, t]
  );

  const handleImageFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList?.length) void handleDropImageFiles(Array.from(fileList));
      e.target.value = '';
    },
    [handleDropImageFiles]
  );

  const openImageLibrary = useCallback(() => {
    setAssetPickerMode('image');
    setAssetPickerOpen(true);
  }, []);

  const flushAllSlides = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await Promise.all(
      slides.map((slide) =>
        updateSlide.mutateAsync({
          id: slide.id,
          canvas_data: slide.canvas_data,
          background_color: slide.background_color,
          title: slide.title,
        })
      )
    );
    setDirty(false);
    setSaveStatus('saved');
  }, [slides, updateSlide, setDirty]);

  const handleSetImageAsBackground = useCallback(async () => {
    if (!activeSlideId || !selectedElementId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    const element = slide?.canvas_data.find((el) => el.id === selectedElementId);
    if (!slide || !element?.props.src) return;
    if (element.type !== 'image' && element.type !== 'pdf') return;

    try {
      const src = element.props.src;
      const updated = await setSlideBackgroundSrc.mutateAsync({ id: activeSlideId, src });

      const newCanvas = slide.canvas_data.filter((el) => el.id !== element.id);
      updateSlideCanvas(activeSlideId, newCanvas);
      updateSlideMeta(activeSlideId, {
        background_image: updated.background_image,
        background_src: updated.background_src || src,
        background_image_url: updated.background_image_url,
      });
      updateSlide.mutate({ id: activeSlideId, canvas_data: newCanvas });
      setSelectedElementId(null);
      toast.success(t('toasts.backgroundSet'));
    } catch {
      toast.error(t('toasts.backgroundSetFailed'));
    }
  }, [
    activeSlideId,
    selectedElementId,
    slides,
    setSlideBackgroundSrc,
    updateSlideCanvas,
    updateSlideMeta,
    updateSlide,
    setSelectedElementId,
    t,
  ]);

  const handleDetachSlideBackground = useCallback(async () => {
    if (!activeSlideId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide?.background_image_url) return;

    const src = slide.background_image_url;
    const maxZ = slide.canvas_data.reduce((m, el) => Math.max(m, el.z), 0);
    const newElement: CanvasElement = {
      id: newElementId(),
      type: 'image',
      x: 0,
      y: 0,
      w: SLIDE_WIDTH,
      h: SLIDE_HEIGHT,
      z: maxZ + 1,
      props: { src, name: 'Background' },
    };

    const newCanvas = [...slide.canvas_data, newElement];
    updateSlideCanvas(activeSlideId, newCanvas);

    try {
      const updated = await clearSlideBackground.mutateAsync(activeSlideId);
      updateSlideMeta(activeSlideId, {
        background_image: updated.background_image,
        background_src: updated.background_src || '',
        background_image_url: updated.background_image_url,
      });
      updateSlide.mutate({ id: activeSlideId, canvas_data: newCanvas });
      setSelectedElementId(newElement.id);
      toast.success(t('toasts.backgroundDetached'));
    } catch {
      toast.error(t('toasts.backgroundDetachFailed'));
    }
  }, [
    activeSlideId,
    slides,
    updateSlideCanvas,
    clearSlideBackground,
    updateSlideMeta,
    updateSlide,
    setSelectedElementId,
    t,
  ]);

  const handlePinPlace = (x: number, y: number) => {
    setPendingPinPos({ x, y });
    setAssetPickerMode('pin-product');
    setAssetPickerOpen(true);
    setPinMode(false);
  };

  const pins = pinsQuery.data || [];
  const canvasPins = pins
    .filter((p) => p.slide === activeSlideId || p.slide_id === activeSlideId)
    .map((p) => ({ id: p.id, x: p.x, y: p.y, label: p.label || p.product_name || '' }));

  if (isLoading || !presentation) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <EditorToolbar
        title={presentation.title}
        presentationId={presentationId}
        saveStatus={saveStatus}
        onShare={() => setShareOpen(true)}
        canShare={canShare}
        onStartTimer={() => {
          if (!user?.studio?.id) return;
          procurementMutation.mutate({
            url: 'time_tracker/clock-in/',
            data: {
              project: presentation.project,
              presentation: presentationId,
              description: `Presentation: ${presentation.title}`,
              studio: user.studio.id,
            },
          }, {
            onSuccess: () => toast.success(t('toasts.timerStarted')),
            onError: () => toast.error(t('toasts.timerFailed')),
          });
        }}
      />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative flex flex-col min-w-0">
          {canEdit && (
            <input
              ref={imageUploadRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={handleImageFileInput}
            />
          )}
          <PresentationCanvas
            readOnly={!canEdit}
            onPinPlace={canEdit ? handlePinPlace : undefined}
            pins={canvasPins}
            onAddText={canEdit ? handleQuickAddText : undefined}
            onUploadImage={canEdit ? triggerImageUpload : undefined}
            onAddImage={canEdit ? openImageLibrary : undefined}
            onAddShape={canEdit ? handleQuickAddShape : undefined}
            onApplyTheme={canEdit ? handleApplyTheme : undefined}
            onDropImageFiles={canEdit ? handleDropImageFiles : undefined}
            onSetImageAsBackground={canEdit ? handleSetImageAsBackground : undefined}
            onDetachSlideBackground={canEdit ? handleDetachSlideBackground : undefined}
          />
          {canEdit && (
            <AddElementMenu
              onUploadImage={triggerImageUpload}
              onAddImage={openImageLibrary}
              onAddProduct={() => { setAssetPickerMode('product'); setAssetPickerOpen(true); }}
              onAddScene={() => { setAssetPickerMode('scene'); setAssetPickerOpen(true); }}
              onAddNewPage={handleAddSlide}
            />
          )}
        </div>

        {canEdit && (
          <SlideNavigator
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onReorder={(ids) => reorderSlides.mutate(ids)}
            onBackgroundColorChange={handleBackgroundColorChange}
          />
        )}

        <PinsPanel
          pins={pins}
          canEdit={canEdit}
          onAddProductPin={() => { setPinMode(true); toast.info(t('pinsPanel.clickToPlace')); }}
          onAddScenePin={() => { setAssetPickerMode('pin-scene'); setAssetPickerOpen(true); }}
          onPinClick={(pin) => {
            if (pin.slide_id) setActiveSlideId(pin.slide_id);
            else if (pin.slide) setActiveSlideId(pin.slide);
          }}
          onAddToProcurement={(pin) => {
            if (pin.product) setProcurementPin(pin);
          }}
        />
      </div>

      <AssetPickerDialog
        open={assetPickerOpen}
        onClose={() => { setAssetPickerOpen(false); setPendingPinPos(null); }}
        mode={assetPickerMode}
        projectId={presentation.project}
        onUploadFromComputer={triggerImageUpload}
        onSelectProduct={(product) => {
          const img = getProductImageUrl(product);
          if (assetPickerMode === 'pin-product' && pendingPinPos && activeSlideId) {
            createPin.mutate({
              slide: activeSlideId,
              pin_type: 'product',
              product: product.id,
              x: pendingPinPos.x,
              y: pendingPinPos.y,
              label: product.name,
            });
            setPendingPinPos(null);
            return;
          }
          if (!img) {
            toast.error(t('toasts.noProductImage'));
            return;
          }
          addElementToCanvas({
            id: newElementId(),
            type: 'image',
            x: 100,
            y: 100,
            w: 400,
            h: 300,
            z: 0,
            props: { src: img, name: product.name },
          });
        }}
        onSelectScene={(asset) => {
          if (!asset.image_url) {
            toast.error(t('toasts.noSceneImage'));
            return;
          }
          if (assetPickerMode === 'pin-scene' && activeSlideId) {
            createPin.mutate({
              slide: activeSlideId,
              pin_type: 'scene',
              design_asset: asset.id,
              x: pendingPinPos?.x ?? 200,
              y: pendingPinPos?.y ?? 200,
              label: asset.prompt || t('assetPicker.scene'),
            });
            setPendingPinPos(null);
            return;
          }
          addElementToCanvas({
            id: newElementId(),
            type: 'image',
            x: 80,
            y: 80,
            w: 500,
            h: 350,
            z: 0,
            props: { src: asset.image_url, name: asset.prompt },
          });
        }}
        onSelectDocument={(_doc, fileUrl) => {
          addElementToCanvas({
            id: newElementId(),
            type: 'image',
            x: 100,
            y: 100,
            w: 500,
            h: 350,
            z: 0,
            props: { src: fileUrl },
          });
        }}
      />

      <SharePresentationDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        presentation={presentation}
        isSubmitting={publishPresentation.isPending}
        onPublish={(data) => {
          flushAllSlides()
            .then(() => {
              publishPresentation.mutate(
                { id: presentationId, ...data },
                {
                  onSuccess: () => {
                    setShareOpen(false);
                    toast.success(t('toasts.published'));
                  },
                  onError: () => toast.error(t('toasts.publishFailed')),
                }
              );
            })
            .catch(() => toast.error(t('toasts.saveFailed')));
        }}
      />

      {procurementPin?.product && (
        <AddToProjectDialog
          open={!!procurementPin}
          onOpenChange={(open) => !open && setProcurementPin(null)}
          product={{
            id: procurementPin.product,
            name: procurementPin.product_name || procurementPin.label || 'Product',
            retail_price: procurementPin.product_price ?? undefined,
            images: procurementPin.product_image_url
              ? [{ image: procurementPin.product_image_url, is_primary: true }]
              : [],
          }}
          onSubmit={(data) => {
            if (!user?.studio?.id || !user?.id) {
              toast.error(t('toasts.missingInfo'));
              return;
            }
            procurementMutation.mutate({
              url: 'projects/procurements/',
              data: {
                quantity: data.quantity,
                project: data.projectId,
                room: data.roomId,
                product: data.productId,
                studio: user.studio.id,
                created_by: user.id,
                updated_by: user.id,
              },
            }, {
              onSuccess: () => {
                setProcurementPin(null);
                toast.success(t('toasts.addedToProcurement'));
              },
              onError: () => toast.error(t('toasts.procurementFailed')),
            });
          }}
        />
      )}
    </div>
  );
}
