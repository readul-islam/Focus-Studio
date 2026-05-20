'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop/types';
import { Camera, Loader2, X } from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { dataUrlToFile, getCroppedImageDataUrl, validateRasterImageFile } from '@/lib/image-crop';

type ImageCropUploadProps = {
  label: string;
  description?: string;
  /** Current image URL from server */
  imageUrl?: string | null;
  fallbackLetter?: string;
  /** 1 = square (logo), 16/9 = cover, etc. */
  aspect?: number;
  previewShape?: 'circle' | 'rounded';
  onUpload: (file: File) => Promise<string | void>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
};

export function ImageCropUpload({
  label,
  description,
  imageUrl,
  fallbackLetter = '?',
  aspect = 1,
  previewShape = 'rounded',
  onUpload,
  onRemove,
  disabled,
}: ImageCropUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const displayUrl = preview || imageUrl;
  const shapeClass =
    previewShape === 'circle' ? 'rounded-full' : 'rounded-xl';

  function pickFile(file: File) {
    const v = validateRasterImageFile(file);
    if (!v.ok) {
      toast.error(v.message);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPreview(url);
      setTimeout(() => setShowCrop(true), 50);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        ) : null}
      </div>

      <div
        className={cn(
          'relative group w-28 h-28',
          previewShape === 'circle' && 'mx-auto',
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (disabled) return;
          const file = e.dataTransfer?.files?.[0];
          if (file) pickFile(file);
        }}
      >
        <div
          className={cn(
            'relative w-full h-full overflow-hidden bg-muted border border-border flex items-center justify-center',
            shapeClass,
          )}
        >
          {displayUrl ? (
            <img src={displayUrl} alt="" className="object-cover w-full h-full" />
          ) : (
            <span className="text-2xl font-medium text-muted-foreground">
              {fallbackLetter.charAt(0).toUpperCase()}
            </span>
          )}

          {!disabled && (
            <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="inline-flex items-center gap-1 bg-black/75 text-white text-[10px] px-4 py-1.5 cursor-pointer rounded-b-xl w-full justify-center">
                <Camera className="size-3" />
                Change
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) pickFile(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          )}
        </div>

        {displayUrl && onRemove && !disabled ? (
          <button
            type="button"
            onClick={async () => {
              try {
                await onRemove();
                setPreview(null);
                toast.success('Image removed');
              } catch {
                toast.error('Could not remove image');
              }
            }}
            className="absolute -top-1 -right-1 bg-background rounded-full p-1 shadow border"
            aria-label={`Remove ${label}`}
          >
            <X className="size-3 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      <Dialog open={showCrop && !!preview} onOpenChange={(open) => !open && setShowCrop(false)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Crop {label.toLowerCase()}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-80 bg-muted rounded-lg overflow-hidden relative">
            <Cropper
              image={preview || ''}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setCroppedAreaPixels(area)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => setShowCrop(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isUploading}
              onClick={async () => {
                if (!croppedAreaPixels || !preview) return;
                setIsUploading(true);
                try {
                  const dataUrl = await getCroppedImageDataUrl(preview, croppedAreaPixels);
                  const file = dataUrlToFile(dataUrl, `${label.replace(/\s+/g, '-')}-${Date.now()}.png`);
                  const newUrl = await onUpload(file);
                  if (typeof newUrl === 'string') setPreview(newUrl);
                  setShowCrop(false);
                  toast.success(`${label} updated`);
                } catch {
                  toast.error('Could not upload image');
                } finally {
                  setIsUploading(false);
                }
              }}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              {isUploading ? 'Uploading…' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
