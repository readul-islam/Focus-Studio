import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  [key: string]: any;
}

export default function ProductImage({ src, alt, className = '', fill, ...props }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  if (fill) {
    return (
      <Image
        src={imgSrc || '/product-placeholder-wp.jpg'}
        alt={alt || 'Product image'}
        fill
        className={className}
        onError={() => setImgSrc('/product-placeholder-wp.jpg')}
        {...props}
      />
    );
  }

  return (
    <Image
      src={imgSrc || '/product-placeholder-wp.jpg'}
      alt={alt || 'Product image'}
      width={400}
      height={400}
      className={className}
      onError={() => setImgSrc('/product-placeholder-wp.jpg')}
      {...props}
    />
  );
}
