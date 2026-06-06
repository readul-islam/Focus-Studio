const MAX_INLINE_IMAGE_BYTES = 3 * 1024 * 1024;

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('unsupported'));
      return;
    }
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      reject(new Error('too_large'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('load_failed'));
    img.src = src;
  });
}

export function fitImageToSlide(
  naturalWidth: number,
  naturalHeight: number,
  slideWidth: number,
  slideHeight: number,
  maxCoverage = 0.85
) {
  const maxW = slideWidth * maxCoverage;
  const maxH = slideHeight * maxCoverage;
  const scale = Math.min(maxW / naturalWidth, maxH / naturalHeight, 1);
  const w = Math.round(naturalWidth * scale);
  const h = Math.round(naturalHeight * scale);
  return {
    w,
    h,
    x: Math.round((slideWidth - w) / 2),
    y: Math.round((slideHeight - h) / 2),
  };
}
