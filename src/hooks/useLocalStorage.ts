import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export type LocalStorageNormalizer<T> = (value: unknown) => T | null;

export interface LocalStorageOptions<T> {
  normalize?: LocalStorageNormalizer<T>;
  syncTabs?: boolean;
}

export function parseStoredJson<T>(
  raw: string | null,
  fallback: T,
  normalize?: LocalStorageNormalizer<T>,
): T {
  if (raw === null) return fallback;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!normalize) return parsed as T;
    return normalize(parsed) ?? fallback;
  } catch {
    return fallback;
  }
}

function readStoredValue<T>(
  key: string,
  fallback: T,
  normalize?: LocalStorageNormalizer<T>,
): T {
  if (typeof window === 'undefined') return fallback;

  try {
    return parseStoredJson(window.localStorage.getItem(key), fallback, normalize);
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: LocalStorageOptions<T> = {},
): readonly [T, Dispatch<SetStateAction<T>>] {
  const fallbackRef = useRef(initialValue);
  const normalizeRef = useRef(options.normalize);
  fallbackRef.current = initialValue;
  normalizeRef.current = options.normalize;

  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue, options.normalize));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }, [key, value]);

  useEffect(() => {
    if (options.syncTabs === false) return undefined;

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== key) return;
      setValue(parseStoredJson(event.newValue, fallbackRef.current, normalizeRef.current));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, options.syncTabs]);

  return [value, setValue] as const;
}
