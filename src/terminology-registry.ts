export type TerminologyCategory =
  | 'character'
  | 'arc-type'
  | 'attribute'
  | 'role'
  | 'combat'
  | 'stat'
  | 'progression';

export type TerminologyEvidenceTier =
  | 'current-russian-client'
  | 'official-russian-publication'
  | 'official-english-publication'
  | 'current-guide-transcription'
  | 'project-translation';

export type TerminologyConfidence =
  | 'confirmed'
  | 'strong'
  | 'provisional'
  | 'project-translation';

export interface TerminologyEntry {
  id: string;
  category: TerminologyCategory;
  en: string;
  ru: string;
  aliases?: {
    en?: readonly string[];
    ru?: readonly string[];
  };
  evidenceTier: TerminologyEvidenceTier;
  confidence: TerminologyConfidence;
  sourceUrl?: string;
  verifiedAt: string;
  note?: string;
}

const VERIFIED_AT = '2026-08-04';
const SHINKU_OFFICIAL_RU_SOURCE =
  'https://nte.perfectworld.com/ru/article/news/gamenews/20260706/263024.html';

/**
 * Machine-readable provenance for terms whose wording materially affects
 * player understanding or whose Russian form has previously been disputed.
 *
 * This registry intentionally starts with high-risk terms. Ordinary editorial
 * sentences remain in the i18n layer; canonical storage and API IDs remain
 * unchanged.
 */
export const terminologyRegistry = [
  {
    id: 'character:Shinku',
    category: 'character',
    en: 'Shinku',
    ru: 'Шинку',
    aliases: { ru: ['Синку'] },
    evidenceTier: 'official-russian-publication',
    confidence: 'confirmed',
    sourceUrl: SHINKU_OFFICIAL_RU_SOURCE,
    verifiedAt: VERIFIED_AT,
    note: 'Official Russian Version 1.2 publication repeatedly uses «Шинку». «Синку» remains search/storage compatibility only.',
  },
  {
    id: 'character:Zero',
    category: 'character',
    en: 'Zero',
    ru: 'Оценщик',
    aliases: { ru: ['Зеро', 'Зеро эспер', 'Нулевой эспер'] },
    evidenceTier: 'current-russian-client',
    confidence: 'provisional',
    verifiedAt: VERIFIED_AT,
    note: 'Primary label follows the current project/client convention. Public official Russian evidence for the character-name/title distinction remains incomplete.',
  },
  {
    id: 'arc-type:Plasma',
    category: 'arc-type',
    en: 'Plasma',
    ru: 'Плазменный',
    aliases: { ru: ['Плазма'] },
    evidenceTier: 'current-russian-client',
    confidence: 'confirmed',
    verifiedAt: VERIFIED_AT,
    note: 'Owner-confirmed current in-client label. No public official Russian Arc-type list was found during the focused audit.',
  },
  {
    id: 'combat:break-gauge',
    category: 'combat',
    en: 'Break Gauge',
    ru: 'Шкала разрушения',
    evidenceTier: 'current-russian-client',
    confidence: 'strong',
    verifiedAt: VERIFIED_AT,
  },
  {
    id: 'combat:break-intensity',
    category: 'combat',
    en: 'Break Intensity',
    ru: 'Интенсивность разрушения',
    evidenceTier: 'current-russian-client',
    confidence: 'strong',
    verifiedAt: VERIFIED_AT,
  },
  {
    id: 'combat:broken-target',
    category: 'combat',
    en: 'Broken target',
    ru: 'Сломленная цель',
    aliases: { ru: ['Сломленный враг'] },
    evidenceTier: 'current-russian-client',
    confidence: 'strong',
    verifiedAt: VERIFIED_AT,
    note: 'Target state is kept distinct from the Break mechanic and gauge.',
  },
  {
    id: 'combat:esper-cycle',
    category: 'combat',
    en: 'Esper Cycle',
    ru: 'Цикл эспера',
    evidenceTier: 'project-translation',
    confidence: 'project-translation',
    verifiedAt: VERIFIED_AT,
    note: 'Project translation retained until a current official Russian client/publication label is independently captured.',
  },
] as const satisfies readonly TerminologyEntry[];

export type TerminologyId = (typeof terminologyRegistry)[number]['id'];

const terminologyById = new Map<string, TerminologyEntry>(
  terminologyRegistry.map((entry) => [entry.id, entry]),
);

export function getTerminologyEntry(id: string): TerminologyEntry | undefined {
  return terminologyById.get(id);
}

export function terminologySearchTokens(entry: TerminologyEntry): readonly string[] {
  return [
    entry.en,
    entry.ru,
    ...(entry.aliases?.en ?? []),
    ...(entry.aliases?.ru ?? []),
  ];
}
