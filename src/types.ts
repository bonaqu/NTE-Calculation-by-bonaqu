export type Locale = 'ru' | 'en';
export type RouteKey = 'home' | 'team' | 'arcs' | 'progression' | 'database' | 'methodology';

export interface LocalizedText {
  ru: string;
  en: string;
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
  effect: {
    atkPct?: number;
    critRate?: number;
    critDmg?: number;
    dmgBonus?: number;
    teamDmgBonus?: number;
    defIgnore?: number;
  };
  sourceId: string;
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
