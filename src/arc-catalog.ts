import { arcDirectory, type ArcDirectoryEntry } from './arc-directory';

export type ArcCatalogEntry = Omit<ArcDirectoryEntry, 'sourceId'> & { sourceId: string };

export const arcCatalog: ArcCatalogEntry[] = arcDirectory.map((arc) => ({
  ...arc,
  sourceId: arc.name === 'The Wrong Gate' ? 'gamewith-wrong-gate' : arc.sourceId,
}));

export const arcCatalogSourceIds = ['prydwen-arcs', 'gamewith-wrong-gate'] as const;
