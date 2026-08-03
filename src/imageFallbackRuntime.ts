import { imageFallbackText } from './components/ResilientImage';

const APPLIED_ATTRIBUTE = 'data-resilient-fallback-applied';

function imageLabel(image: HTMLImageElement): string {
  const ownLabel = image.alt.trim();
  if (ownLabel) return ownLabel;
  return image.closest('[aria-label]')?.getAttribute('aria-label')?.trim() || 'Artwork';
}

export function replaceFailedImage(image: HTMLImageElement): void {
  if (image.hasAttribute(APPLIED_ATTRIBUTE)) return;
  image.setAttribute(APPLIED_ATTRIBUTE, 'true');
  image.hidden = true;

  if (image.closest('.arc-directory-art')) return;

  const label = imageLabel(image);
  const fallback = document.createElement('span');
  fallback.className = 'runtime-image-fallback';
  fallback.textContent = imageFallbackText(label);
  fallback.setAttribute('role', 'img');
  fallback.setAttribute('aria-label', label);
  fallback.setAttribute('data-image-source-failed', 'true');
  image.insertAdjacentElement('beforebegin', fallback);
}

export function installImageFallbackRuntime(): () => void {
  const handleError = (event: Event) => {
    if (event.target instanceof HTMLImageElement) replaceFailedImage(event.target);
  };

  document.addEventListener('error', handleError, true);
  return () => document.removeEventListener('error', handleError, true);
}

installImageFallbackRuntime();
