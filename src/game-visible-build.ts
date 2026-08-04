import { characterCatalog } from './characters';
import type { LocalizedText } from './types';

export const GAME_VISIBLE_BUILD_VERSION = 1 as const;
export const GAME_VISIBLE_TEAM_STORAGE_KEY = 'nte.team.visible.v1';
export const GAME_VISIBLE_TEAM_SLOTS = 4;

export type CombatModelCoverage = 'verified' | 'partial' | 'relative-only' | 'unavailable';
export type VisibleTestModeId =
  | 'neutral-reference'
  | 'burst-reference'
  | 'training-target'
  | 'verified-action';

export interface VisibleCombatStats {
  hp: number;
  atk: number;
  def: number;
  critRate: number;
  critDamage: number;
  damageBonus: number;
  attributeDamageBonus: number;
  chargeSpeed: number;
  cycleIntensity: number;
  breakIntensity: number;
}

export interface VisibleArcBuild {
  arcName: string;
  level: number;
  maxLevel: number;
  baseAtk: number;
  secondaryLabel: string;
  secondaryValue: number;
  mixingRank: number;
  afterUltimateActive: boolean;
}

export interface VisibleSkillLevels {
  basic: number;
  skill: number;
  ultimate: number;
  support: number;
}

export interface VisibleConsoleBuild {
  gridType: number;
  typeThreeModules: number;
}

export interface GameVisibleCharacterBuild {
  characterName: string;
  level: number;
  maxLevel: number;
  awakeningLevel: number;
  /**
   * Base ATK is separate from final displayed ATK and is requested only when a
   * selected verified support effect explicitly scales from it.
   */
  baseAtk: number;
  activeTeamEffectIds: string[];
  stats: VisibleCombatStats;
  arc: VisibleArcBuild;
  skills: VisibleSkillLevels;
  console: VisibleConsoleBuild;
  testMode: VisibleTestModeId;
  verifiedActionId: string;
}

export interface VisibleTargetProfile {
  level: number;
  resistance: number;
  defenceReduction: number;
  resistanceReduction: number;
  boss: boolean;
}

export interface GameVisibleTeamState {
  version: typeof GAME_VISIBLE_BUILD_VERSION;
  activeSlot: number;
  duration: number;
  builds: GameVisibleCharacterBuild[];
  target: VisibleTargetProfile;
}

export interface CharacterCombatCoverage {
  characterName: string;
  coverage: CombatModelCoverage;
  supportedModes: readonly VisibleTestModeId[];
  verifiedAt: string;
  sourcePublisher: string;
  sourceUrl?: string;
  note: LocalizedText;
}

const zeroStats = (): VisibleCombatStats => ({
  hp: 0,
  atk: 0,
  def: 0,
  critRate: 0,
  critDamage: 0,
  damageBonus: 0,
  attributeDamageBonus: 0,
  chargeSpeed: 100,
  cycleIntensity: 0,
  breakIntensity: 0,
});

const emptyArc = (): VisibleArcBuild => ({
  arcName: '',
  level: 1,
  maxLevel: 80,
  baseAtk: 0,
  secondaryLabel: '',
  secondaryValue: 0,
  mixingRank: 1,
  afterUltimateActive: false,
});

export function createEmptyGameVisibleBuild(characterName: string): GameVisibleCharacterBuild {
  return {
    characterName,
    level: 1,
    maxLevel: 20,
    awakeningLevel: 0,
    baseAtk: 0,
    activeTeamEffectIds: [],
    stats: zeroStats(),
    arc: emptyArc(),
    skills: { basic: 1, skill: 1, ultimate: 1, support: 1 },
    console: { gridType: 0, typeThreeModules: 0 },
    testMode: 'neutral-reference',
    verifiedActionId: '',
  };
}

/**
 * First-party evidence supplied by the repository owner from the current Russian
 * client. Final displayed ATK is intentionally stored as one number. The
 * screenshot also exposes a 1126 + 900 split, but Base ATK is not required by
 * Shinku's current tests and therefore is not seeded as an ordinary input.
 */
export const shinkuScreenshotBuild: GameVisibleCharacterBuild = {
  characterName: 'Shinku',
  level: 70,
  maxLevel: 70,
  awakeningLevel: 5,
  baseAtk: 0,
  activeTeamEffectIds: [],
  stats: {
    hp: 21_316,
    atk: 2_026,
    def: 968,
    critRate: 79,
    critDamage: 176.4,
    damageBonus: 8,
    attributeDamageBonus: 10,
    chargeSpeed: 100,
    cycleIntensity: 0,
    breakIntensity: 48,
  },
  arc: {
    arcName: 'Blushing Mirage',
    level: 80,
    maxLevel: 80,
    baseAtk: 570,
    secondaryLabel: 'CRIT Rate',
    secondaryValue: 24,
    mixingRank: 1,
    afterUltimateActive: false,
  },
  skills: { basic: 9, skill: 9, ultimate: 9, support: 8 },
  console: { gridType: 2, typeThreeModules: 4 },
  testMode: 'neutral-reference',
  verifiedActionId: '',
};

const currentClientEvidence = {
  publisher: 'Owner-supplied current Russian client screenshots',
  verifiedAt: '2026-08-04',
};

const releasedCharacters = characterCatalog.filter((character) => character.releaseStatus === 'released');
const verifiedActionCharacters = new Set(['Shinku', 'Nanally', 'Chaos', 'Lacrimosa', 'Zero', 'Hathor', 'Jiuyuan']);

export const characterCombatCoverage: readonly CharacterCombatCoverage[] = releasedCharacters.map((character) => {
  if (character.name === 'Shinku') {
    return {
      characterName: character.name,
      coverage: 'partial',
      supportedModes: ['neutral-reference', 'burst-reference', 'training-target', 'verified-action'],
      verifiedAt: currentClientEvidence.verifiedAt,
      sourcePublisher: currentClientEvidence.publisher,
      note: {
        ru: 'Видимые характеристики, дуга, уровни навыков и русские подписи подтверждены скриншотами клиента. Конкретный урон доступен только для отдельно проверенных действий.',
        en: 'Visible stats, Arc, skill levels and Russian labels are confirmed by client screenshots. Exact damage is available only for separately verified actions.',
      },
    } satisfies CharacterCombatCoverage;
  }

  if (verifiedActionCharacters.has(character.name)) {
    return {
      characterName: character.name,
      coverage: 'partial',
      supportedModes: ['neutral-reference', 'training-target', 'verified-action'],
      verifiedAt: '2026-08-04',
      sourcePublisher: character.sourcePublisher ?? 'Prydwen Institute',
      ...(character.sourceUrl ? { sourceUrl: character.sourceUrl } : {}),
      note: {
        ru: 'Для персонажа доступны контрольные тесты видимых характеристик и несколько отдельно подтверждённых срабатываний. Полная ротация ещё не моделируется.',
        en: 'The character supports visible-stat reference tests and a small set of separately verified triggers. The full rotation is not modeled yet.',
      },
    } satisfies CharacterCombatCoverage;
  }

  return {
    characterName: character.name,
    coverage: 'relative-only',
    supportedModes: ['neutral-reference', 'training-target'],
    verifiedAt: '2026-08-04',
    sourcePublisher: character.sourcePublisher ?? 'NTE Calculation by bonaqu',
    ...(character.sourceUrl ? { sourceUrl: character.sourceUrl } : {}),
    note: {
      ru: 'Персонаж поддерживает ввод видимых характеристик и нормализованный сравнительный тест. Проверенная модель конкретных навыков ещё не опубликована.',
      en: 'The character supports visible-stat entry and a normalized comparison test. A verified action model has not been published yet.',
    },
  } satisfies CharacterCombatCoverage;
});

export const combatCoverageByCharacter = new Map(
  characterCombatCoverage.map((record) => [record.characterName, record]),
);

export const screenshotConfirmedRussianLabels = {
  hp: 'ОЗ',
  atk: 'Атака',
  def: 'Защита',
  stamina: 'Выносливость',
  critRate: 'Шанс крит. удара',
  critDamage: 'Крит. урон',
  chargeSpeed: 'Скорость зарядки',
  cycleIntensity: 'Интенсивность цикла',
  breakIntensity: 'Интенсивность разрушения',
  damageBonus: 'Бонус к урону',
  cosmosDamageBonus: 'Бонус к урону космоса',
  arc: 'Дуга',
  arcEffect: 'Эффект дуги',
  mixing: 'Смешивание',
  basicAttack: 'Базовая атака',
  skill: 'Навык',
  ultimate: 'Сверхспособность',
  supportSkill: 'Навык поддержки',
  awakening: 'Пробуждение',
  esperAbility: 'Способность эспера',
  console: 'Консоль',
  ascension: 'Восхождение',
  progressionMaterial: 'Материал развития',
} as const;

const finite = (value: unknown, fallback = 0): number => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const clamp = (value: unknown, min: number, max: number, fallback = min): number => Math.min(max, Math.max(min, finite(value, fallback)));
const text = (value: unknown, fallback = ''): string => typeof value === 'string' ? value.normalize('NFKC').trim().slice(0, 120) : fallback;

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => text(entry))
    .filter(Boolean))].slice(0, 12);
}

function normalizeStats(value: unknown): VisibleCombatStats {
  const input = isRecord(value) ? value : {};
  return {
    hp: clamp(input.hp, 0, 9_999_999),
    atk: clamp(input.atk, 0, 999_999),
    def: clamp(input.def, 0, 999_999),
    critRate: clamp(input.critRate, 0, 100),
    critDamage: clamp(input.critDamage, 0, 1_000),
    damageBonus: clamp(input.damageBonus, -100, 1_000),
    attributeDamageBonus: clamp(input.attributeDamageBonus, -100, 1_000),
    chargeSpeed: clamp(input.chargeSpeed, 0, 1_000, 100),
    cycleIntensity: clamp(input.cycleIntensity, 0, 99_999),
    breakIntensity: clamp(input.breakIntensity, 0, 99_999),
  };
}

function normalizeArc(value: unknown): VisibleArcBuild {
  const input = isRecord(value) ? value : {};
  return {
    arcName: text(input.arcName),
    level: Math.trunc(clamp(input.level, 1, 80, 1)),
    maxLevel: Math.trunc(clamp(input.maxLevel, 1, 80, 80)),
    baseAtk: clamp(input.baseAtk, 0, 9_999),
    secondaryLabel: text(input.secondaryLabel),
    secondaryValue: clamp(input.secondaryValue, -1_000, 10_000),
    mixingRank: Math.trunc(clamp(input.mixingRank, 1, 5, 1)),
    afterUltimateActive: input.afterUltimateActive === true,
  };
}

function normalizeBuild(value: unknown, fallbackName: string): GameVisibleCharacterBuild {
  const input = isRecord(value) ? value : {};
  const characterName = characterCatalog.some((character) => character.name === input.characterName)
    ? String(input.characterName)
    : fallbackName;
  const skills = isRecord(input.skills) ? input.skills : {};
  const consoleBuild = isRecord(input.console) ? input.console : {};
  const mode = input.testMode;
  return {
    characterName,
    level: Math.trunc(clamp(input.level, 1, 80, 1)),
    maxLevel: Math.trunc(clamp(input.maxLevel, 1, 80, 20)),
    awakeningLevel: Math.trunc(clamp(input.awakeningLevel, 0, 6)),
    baseAtk: clamp(input.baseAtk, 0, 99_999),
    activeTeamEffectIds: normalizeStringArray(input.activeTeamEffectIds),
    stats: normalizeStats(input.stats),
    arc: normalizeArc(input.arc),
    skills: {
      basic: Math.trunc(clamp(skills.basic, 1, 15, 1)),
      skill: Math.trunc(clamp(skills.skill, 1, 15, 1)),
      ultimate: Math.trunc(clamp(skills.ultimate, 1, 15, 1)),
      support: Math.trunc(clamp(skills.support, 1, 15, 1)),
    },
    console: {
      gridType: Math.trunc(clamp(consoleBuild.gridType, 0, 8)),
      typeThreeModules: Math.trunc(clamp(consoleBuild.typeThreeModules, 0, 8)),
    },
    testMode: mode === 'burst-reference' || mode === 'training-target' || mode === 'verified-action'
      ? mode
      : 'neutral-reference',
    verifiedActionId: text(input.verifiedActionId),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function initialGameVisibleTeamState(): GameVisibleTeamState {
  return {
    version: GAME_VISIBLE_BUILD_VERSION,
    activeSlot: 0,
    duration: 30,
    builds: [
      shinkuScreenshotBuild,
      createEmptyGameVisibleBuild('Hathor'),
      createEmptyGameVisibleBuild('Zero'),
      createEmptyGameVisibleBuild('Nanally'),
    ],
    target: {
      level: 80,
      resistance: 10,
      defenceReduction: 0,
      resistanceReduction: 0,
      boss: true,
    },
  };
}

export function normalizeGameVisibleTeamState(value: unknown): GameVisibleTeamState | null {
  if (!isRecord(value) || value.version !== GAME_VISIBLE_BUILD_VERSION || !Array.isArray(value.builds)) return null;
  const inputBuilds = value.builds;
  const fallback = initialGameVisibleTeamState();
  const builds = Array.from({ length: GAME_VISIBLE_TEAM_SLOTS }, (_, index) => normalizeBuild(
    inputBuilds[index],
    fallback.builds[index]?.characterName ?? 'Zero',
  ));
  const target = isRecord(value.target) ? value.target : {};
  return {
    version: GAME_VISIBLE_BUILD_VERSION,
    activeSlot: Math.trunc(clamp(value.activeSlot, 0, GAME_VISIBLE_TEAM_SLOTS - 1)),
    duration: clamp(value.duration, 1, 600, 30),
    builds,
    target: {
      level: Math.trunc(clamp(target.level, 1, 200, 80)),
      resistance: clamp(target.resistance, -100, 100, 10),
      defenceReduction: clamp(target.defenceReduction, 0, 100),
      resistanceReduction: clamp(target.resistanceReduction, 0, 100),
      boss: target.boss !== false,
    },
  };
}
