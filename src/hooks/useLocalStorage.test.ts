import { describe, expect, it } from 'vitest';
import { parseStoredJson } from './useLocalStorage';

describe('parseStoredJson', () => {
  it('returns the fallback for malformed JSON', () => {
    expect(parseStoredJson('{broken', { count: 7 })).toEqual({ count: 7 });
  });

  it('returns parsed values when no schema normalizer is supplied', () => {
    expect(parseStoredJson('{"count":9}', { count: 7 })).toEqual({ count: 9 });
  });

  it('uses the fallback when schema validation fails', () => {
    const normalize = (value: unknown) => {
      if (typeof value !== 'object' || value === null || !('count' in value)) return null;
      const count = (value as { count?: unknown }).count;
      return typeof count === 'number' && Number.isFinite(count) ? { count } : null;
    };

    expect(parseStoredJson('{"count":"nine"}', { count: 7 }, normalize)).toEqual({ count: 7 });
    expect(parseStoredJson('{"count":9}', { count: 7 }, normalize)).toEqual({ count: 9 });
  });
});
