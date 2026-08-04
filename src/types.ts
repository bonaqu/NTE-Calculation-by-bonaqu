export type Locale = 'ru' | 'en';
export type RouteKey = 'home' | 'team' | 'rotations' | 'arcs' | 'progression' | 'database' | 'methodology';

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

export type EsperCycleId = 'blossom' | 'remora' | 'hexed' | 'nova' | 'scorch' | 'stain' | 'charge' | 'discord';
export type EsperCycleCategory = 'pair' | 'triple';

export interface EsperCycleDefinition {
  id: EsperCycleId;
  name: LocalizedText;
  category: EsperCycleCategory;
  attributes: CharacterAttribute[];
  durationSeconds?: number;
  effect: LocalizedText;
  derivedFrom?: EsperCycleId[];
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export type RotationPhase = 'setup' | 'burst' | 'recovery';
export type RotationActionKind = 'prepare' | 'swap' | 'ultimate' | 'skill' | 'redirect' | 'basic' | 'cycle' | 'recovery';

export interface RotationStep {
  id: string;
  actor: string;
  phase: RotationPhase;
  action: RotationActionKind;
  instruction: LocalizedText;
  outcome: LocalizedText;
  cycle?: EsperCycleId;
  optional?: boolean;
  /** Optional direct term references for future datasets; current presets use the external stable binding table. */
  termRefs?: readonly string[];
}

export interface RotationPreset {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  team: string[];
  cyclePlan: EsperCycleId[];
  assumptions: LocalizedText[];
  steps: RotationStep[];
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
  timingPolicy: LocalizedText;
}