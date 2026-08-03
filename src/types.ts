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
  model: {
    static: ArcModelModifiers;
    conditional: ArcModelModifiers;
    trigger: LocalizedText;
  };
  sourceId: string;
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

export interface CharacterEntry {
  name: string;
  attribute?: string;
  role?: string;
  arcType?: string;
  image?: string;
  detailsVerified: boolean;
}
