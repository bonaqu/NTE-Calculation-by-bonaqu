import { describe, expect, it } from 'vitest';
import { imageFallbackText } from './ResilientImage';

describe('imageFallbackText', () => {
  it('uses the first two word initials for multi-word names', () => {
    expect(imageFallbackText('The Wrong Gate')).toBe('TW');
    expect(imageFallbackText('Youthful Fantasy')).toBe('YF');
  });

  it('uses the first two characters for a single-word name', () => {
    expect(imageFallbackText('Iroi')).toBe('IR');
    expect(imageFallbackText('Ирой')).toBe('ИР');
  });

  it('returns a safe placeholder for empty labels', () => {
    expect(imageFallbackText('   ')).toBe('?');
  });
});
