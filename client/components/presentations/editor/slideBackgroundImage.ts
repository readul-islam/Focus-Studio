'use client';

/** Convert a canvas image src (URL or data URL) into a File for slide background upload */
export async function imageSrcToFile(src: string): Promise<File> {
  if (src.startsWith('data:')) {
    const response = await fetch(src);
    const blob = await response.blob();
    const ext = blob.type.includes('png') ? 'png' : 'jpg';
    return new File([blob], `slide-background.${ext}`, { type: blob.type || 'image/png' });
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not encode image'));
            return;
          }
          resolve(new File([blob], 'slide-background.png', { type: 'image/png' }));
        },
        'image/png'
      );
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}
