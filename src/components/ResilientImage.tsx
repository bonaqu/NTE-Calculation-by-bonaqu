import { useEffect, useState, type ImgHTMLAttributes } from 'react';

export function imageFallbackText(label: string): string {
  const words = label.trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) return '?';

  if (words.length > 1) {
    const first = Array.from(words[0] ?? '')[0] ?? '';
    const second = Array.from(words[1] ?? '')[0] ?? '';
    return `${first}${second}`.toUpperCase() || '?';
  }

  return Array.from(words[0] ?? '').slice(0, 2).join('').toUpperCase() || '?';
}

interface ResilientImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onError'> {
  src?: string;
  alt: string;
  fallback?: string;
  wrapperClassName?: string;
  decorative?: boolean;
}

export function ResilientImage({
  src,
  alt,
  fallback,
  wrapperClassName = '',
  decorative = false,
  ...imageProps
}: ResilientImageProps) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  const className = `resilient-image ${failed ? 'is-fallback' : 'has-image'} ${wrapperClassName}`.trim();

  return <span
    className={className}
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : alt}
    aria-hidden={decorative ? true : undefined}
  >
    <span className="resilient-image-fallback" aria-hidden="true">{fallback ?? imageFallbackText(alt)}</span>
    {!failed && src ? <img
      {...imageProps}
      src={src}
      alt=""
      onError={() => setFailed(true)}
    /> : null}
  </span>;
}
