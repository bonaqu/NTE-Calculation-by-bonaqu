export type Locale = 'ru' | 'en';
export type RouteKey = 'home' | 'team' | 'arcs' | 'progression' | 'database' | 'methodology';

export interface LocalizedText {
  ru: string;
  en: string;
}

export interface ArcModelModifiers {
  atkPct?: number;
  critRate?: number;
  critDmg?: number;
  dmgBonus?: number;
  allyDmgBonus?: number;
  defIgnore?: number;
}

export interface ArcModelDefinition {
  static: ArcModelModifiers;
  conditional: ArcModelModifiers;
  trigger: LocalizedText;
}

export interface ArcPreset {
  id: string;
  name: string;
  rarity: 'S' | 'A' | 'B';
  type: 'Liquid' | 'Solid' | 'Gas' | 'Plasma' | 'Synthesis';
  baseAtk: number;
  secondaryLabel: string;
  secondaryValue: number;
  mixing: number;
  benchmarkPercent?: number;
  benchmarkNote: LocalizedText;
  image: string;
  model?: ArcModelDefinition;
  /** Deprecated compatibility field for the pre-v0.2 dataset. Runtime code must use ModeledArcPreset. */
  effect?: ArcModelModifiers & { teamDmgBonus?: number };
  sourceId: string;
}

export interface ModeledArcPreset extends ArcPreset {
  model: ArcModelDefinition;
}

export interface ArcBenchmarkRow {
  arcId: string;
  percent: number;
  teamDamage?: number;
  teamDps?: number;
  note: LocalizedText;
}

export interface ArcBenchmarkScenario {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  sourceId: string;
  verifiedAt: string;
  meta: LocalizedText[];
  rows: ArcBenchmarkRow[];
}

export interface SourceEntry {
  id: string;
  title: string;
  publisher: string;
  url: string;
  verifiedAt: string;
  scope: LocalizedText;
}

export interface ProgressionStep {
  cap: number;
  beetleCoin: number;
  page: number;
  fading: number;
  blurred: number;
  chaos: number;
}

/** Legacy minimal directory entry kept for compatibility with early data fixtures. */
export interface CharacterEntry {
  name: string;
  attribute?: string;
  role?: string;
  arcType?: string;
  image?: string;
  detailsVerified: boolean;
}

export type CharacterRarity = 'S' | 'A';
export type CharacterAttribute = 'Anima' | 'Chaos' | 'Cosmos' | 'Incantation' | 'Lakshana' | 'Psyche';
export type CharacterRole = 'Damage' | 'Buff' | 'Survival';
export type CharacterArcType = ArcPreset['type'];
export type CharacterReleaseStatus = 'released' | 'upcoming';

export interface CharacterProfile {
  id: string;
  name: string;
  rarity: CharacterRarity;
  attribute: CharacterAttribute;
  role?: CharacterRole;
  arcType?: CharacterArcType;
  releaseStatus: CharacterReleaseStatus;
  releaseVersion?: string;
  image: string;
  summary: LocalizedText;
  sourcePublisher: string;
  sourceUrl: string;
  verifiedAt: string;
  detailsVerified: boolean;
}
