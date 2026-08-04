/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import foundationCss from './interface-foundation.css?raw';
import homeSource from './pages/HomePage.tsx?raw';

describe('restrained interface foundation', () => {
  it('does not add decorative gradients or broad transition shorthands', () => {
    expect(foundationCss).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/u);
    expect(foundationCss).not.toMatch(/\btransition\s*:/u);
    expect(foundationCss).not.toMatch(/transition-property\s*:\s*all/u);
  });

  it('keeps hover feedback static and press feedback restrained', () => {
    const hoverBlocks = foundationCss.match(/[^{}]*:hover\s*\{[^}]*\}/gu) ?? [];
    expect(hoverBlocks.join('\n')).not.toMatch(/translate(?:X|Y)?\s*\(/u);
    expect(foundationCss).toContain('.button:active{scale:.96}');
  });

  it('provides keyboard focus and reduced-motion handling', () => {
    expect(foundationCss).toContain(':focus-visible');
    expect(foundationCss).toContain('@media(prefers-reduced-motion:reduce)');
    expect(foundationCss).toContain('html{scroll-behavior:auto}');
  });

  it('removes the decorative hero-card vocabulary from Home', () => {
    expect(homeSource).not.toMatch(/\borb(?:-a|-b)?\b/u);
    expect(homeSource).not.toContain('hero-data-card');
    expect(homeSource).not.toContain('className="hero"');
    expect(homeSource).not.toContain('tool-card');
  });

  it('derives public home facts from current datasets', () => {
    expect(homeSource).toContain('characterArcGuides.length');
    expect(homeSource).toContain('arcDirectory.length');
    expect(homeSource).toContain('arcBenchmarkScenarios.length');
  });
});
