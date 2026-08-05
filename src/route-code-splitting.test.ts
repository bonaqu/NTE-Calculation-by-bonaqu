/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';
import homeSource from './pages/HomePage.tsx?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./route-loading.css', import.meta.url), 'utf8');

const workspaceFiles = [
  'GameVisibleTeamCalculatorPage',
  'RotationLabPage',
  'ArcExperiencePage',
  'ProgressionPage',
  'DatabasePage',
  'MethodologyPage',
] as const;

describe('lazy route workspace delivery', () => {
  it('keeps Home eager and moves every heavy page behind a dynamic import', () => {
    expect(appSource).toContain("import { HomePage } from './pages/HomePage'");
    for (const page of workspaceFiles) {
      expect(appSource).toContain(`import('./pages/${page}')`);
      expect(appSource).not.toContain(`from './pages/${page}'`);
    }
    expect(appSource).toContain('lazy(workspaceLoaders.team)');
    expect(appSource).toContain('<Suspense fallback={<RouteLoading locale={locale} />}');
  });

  it('preloads workspaces from navigation and Home intent without changing hash routes', () => {
    expect(appSource).toContain('function preloadRoute(route: RouteKey)');
    expect(appSource).toContain('onPointerEnter={() => preloadRoute(key)}');
    expect(appSource).toContain('onFocus={() => preloadRoute(key)}');
    expect(appSource).toContain('location.hash = `#/${next}`');
    expect(appSource).toContain('<HomePage navigate={navigate} preload={preloadRoute} />');
    expect(homeSource).toContain('onPointerEnter: () => preload(route)');
    expect(homeSource).toContain('onFocus: () => preload(route)');
  });

  it('does not pull full Arc and benchmark datasets into the Home runtime graph', () => {
    expect(homeSource).toContain("import { homeProductStats } from '../home-product-stats'");
    expect(homeSource).not.toContain("from '../arc-directory'");
    expect(homeSource).not.toContain("from '../arc-recommendations'");
    expect(homeSource).not.toContain("from '../data'");
  });

  it('provides an accessible reduced-motion loading state', () => {
    expect(appSource).toContain('role="status"');
    expect(appSource).toContain('aria-live="polite"');
    expect(mainSource).toContain("import './route-loading.css'");
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
    expect(css).toContain('animation:none');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
