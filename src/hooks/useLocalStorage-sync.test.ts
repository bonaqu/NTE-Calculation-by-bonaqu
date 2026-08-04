/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import hookSource from './useLocalStorage.ts?raw';

describe('same-tab local storage synchronization contract', () => {
  it('broadcasts one shared-key change without replacing cross-tab storage support', () => {
    expect(hookSource).toContain("SAME_TAB_STORAGE_EVENT = 'nte:local-storage-change'");
    expect(hookSource).toContain('window.dispatchEvent(new CustomEvent<SameTabStorageDetail>');
    expect(hookSource).toContain("window.addEventListener('storage', handleStorage)");
    expect(hookSource).toContain('window.addEventListener(SAME_TAB_STORAGE_EVENT, handleSameTabStorage)');
    expect(hookSource).toContain('raw === serializedRef.current');
  });

  it('keeps malformed and restricted storage contexts non-fatal', () => {
    expect(hookSource).toContain('parseStoredJson');
    expect(hookSource).toContain('Storage or custom events can be unavailable');
    expect(hookSource).toContain('return fallback');
  });
});
