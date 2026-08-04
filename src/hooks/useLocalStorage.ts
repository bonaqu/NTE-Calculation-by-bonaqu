import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export type LocalStorageNormalizer<T> = (value: unknown) => T | null;

export interface LocalStorageOptions<T> {
  normalize?: LocalStorageNormalizer<T>;
  syncTabs?: boolean;
}

interface SameTabStorageDetail {
  key: string;
  raw: string;
}

const SAME_TAB_STORAGE_EVENT = 'nte:local-storage-change';

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
  const serializedRef = useRef('');
  fallbackRef.current = initialValue;
  normalizeRef.current = options.normalize;

  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue, options.normalize));
  let serialized = '';
  try {
    serialized = JSON.stringify(value);
  } catch {
    serialized = '';
  }
  serializedRef.current = serialized;

  useEffect(() => {
    if (!serialized) return;
    try {
      window.localStorage.setItem(key, serialized);
      window.dispatchEvent(new CustomEvent<SameTabStorageDetail>(SAME_TAB_STORAGE_EVENT, {
        detail: { key, raw: serialized },
      }));
    } catch {
      // Storage or custom events can be unavailable in restricted browser contexts.
    }
  }, [key, serialized]);

  useEffect(() => {
    if (options.syncTabs === false) return undefined;

    const applyRaw = (raw: string | null) => {
      if (raw === null || raw === serializedRef.current) return;
      setValue(parseStoredJson(raw, fallbackRef.current, normalizeRef.current));
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== key) return;
      applyRaw(event.newValue);
    };
    const handleSameTabStorage = (event: Event) => {
      const detail = (event as CustomEvent<SameTabStorageDetail>).detail;
      if (!detail || detail.key !== key) return;
      applyRaw(detail.raw);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SAME_TAB_STORAGE_EVENT, handleSameTabStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SAME_TAB_STORAGE_EVENT, handleSameTabStorage);
    };
  }, [key, options.syncTabs]);

  return [value, setValue] as const;
}
