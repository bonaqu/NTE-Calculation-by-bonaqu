import type { LocalizedText } from './types';

export type AscensionMaterialId =
  | 'beetleCoin'
  | 'lostWhispers'
  | 'obscureWhispers'
  | 'paradoxicalWhispers'
  | 'fadingSilhouette'
  | 'blurredSilhouette'
  | 'chaosSilhouette'
  | 'blurredNumeral'
  | 'unsolvedNumeral'
  | 'distortedNumeral'
  | 'suspendedDelusions'
  | 'yearningDelusions'
  | 'transcendentDelusions'
  | 'chargingKnightSparkPlug'
  | 'pageDelusionsShore'
  | 'waterMoonPick'
  | 'nestGuardFragment'
  | 'colorfulTicketStub'
  | 'tearOfTheSea'
  | 'confessionalFlowerSeed';

export type AscensionMaterialCategory = 'currency' | 'common' | 'boss';

export interface AscensionMaterialDefinition {
  id: AscensionMaterialId;
  name: LocalizedText;
  category: AscensionMaterialCategory;
  farm?: LocalizedText;
  originalFarmName?: string;
}

export interface AscensionStepDefinition {
  atLevel: number;
  unlocksLevel: number;
  beetleCoin: number;
  bossCount: number;
  commonTier: 0 | 1 | 2;
  commonCount: number;
}

export interface CharacterAscensionProfile {
  characterName: string;
  commonMaterials: readonly [AscensionMaterialId, AscensionMaterialId, AscensionMaterialId];
  bossMaterial: AscensionMaterialId;
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export const ascensionSteps: AscensionStepDefinition[] = [
  { atLevel: 20, unlocksLevel: 30, beetleCoin: 25_000, bossCount: 0, commonTier: 0, commonCount: 5 },
  { atLevel: 30, unlocksLevel: 40, beetleCoin: 50_000, bossCount: 2, commonTier: 0, commonCount: 12 },
  { atLevel: 40, unlocksLevel: 50, beetleCoin: 75_000, bossCount: 8, commonTier: 1, commonCount: 6 },
  { atLevel: 50, unlocksLevel: 60, beetleCoin: 100_000, bossCount: 16, commonTier: 1, commonCount: 12 },
  { atLevel: 60, unlocksLevel: 70, beetleCoin: 125_000, bossCount: 24, commonTier: 2, commonCount: 6 },
  { atLevel: 70, unlocksLevel: 80, beetleCoin: 150_000, bossCount: 36, commonTier: 2, commonCount: 9 },
];

export const ascensionMaterials: Record<AscensionMaterialId, AscensionMaterialDefinition> = {
  beetleCoin: {
    id: 'beetleCoin', category: 'currency',
    name: { ru: 'Жучиная монета', en: 'Beetle Coin' },
    farm: { ru: '«Магическая сцена Гудини», обмен охотника и исследование мира', en: "Houdinii's Magic Stage, Hunter Exchange and world exploration" },
  },
  lostWhispers: { id: 'lostWhispers', category: 'common', name: { ru: 'Утраченные шёпоты', en: 'Lost Whispers' } },
  obscureWhispers: { id: 'obscureWhispers', category: 'common', name: { ru: 'Смутные шёпоты', en: 'Obscure Whispers' } },
  paradoxicalWhispers: { id: 'paradoxicalWhispers', category: 'common', name: { ru: 'Парадоксальные шёпоты', en: 'Paradoxical Whispers' } },
  fadingSilhouette: { id: 'fadingSilhouette', category: 'common', name: { ru: 'Тусклый силуэт', en: 'Fading Silhouette' } },
  blurredSilhouette: { id: 'blurredSilhouette', category: 'common', name: { ru: 'Размытый силуэт', en: 'Blurred Silhouette' } },
  chaosSilhouette: { id: 'chaosSilhouette', category: 'common', name: { ru: 'Силуэт хаоса', en: 'Chaos Silhouette' } },
  blurredNumeral: { id: 'blurredNumeral', category: 'common', name: { ru: 'Размытая цифра', en: 'Blurred Numeral' } },
  unsolvedNumeral: { id: 'unsolvedNumeral', category: 'common', name: { ru: 'Неразгаданная цифра', en: 'Unsolved Numeral' } },
  distortedNumeral: { id: 'distortedNumeral', category: 'common', name: { ru: 'Искажённая цифра', en: 'Distorted Numeral' } },
  suspendedDelusions: { id: 'suspendedDelusions', category: 'common', name: { ru: 'Застывшие заблуждения', en: 'Suspended Delusions' } },
  yearningDelusions: { id: 'yearningDelusions', category: 'common', name: { ru: 'Тоскующие заблуждения', en: 'Yearning Delusions' } },
  transcendentDelusions: { id: 'transcendentDelusions', category: 'common', name: { ru: 'Трансцендентные заблуждения', en: 'Transcendent Delusions' } },
  chargingKnightSparkPlug: {
    id: 'chargingKnightSparkPlug', category: 'boss',
    name: { ru: 'Свеча зажигания Рыцаря-зарядника', en: 'Charging Knight Spark Plug' },
    farm: { ru: 'Охота на аномалию «Безголовый всадник»', en: 'Anomaly Hunt "Headless Rider"' },
    originalFarmName: 'Headless Rider',
  },
  pageDelusionsShore: {
    id: 'pageDelusionsShore', category: 'boss',
    name: { ru: 'Страница с Берега Заблуждений', en: "A Page from Delusion's Shore" },
    farm: { ru: 'Охота на аномалию «Чёрный том»', en: 'Anomaly Hunt "Black Tome"' },
    originalFarmName: 'Black Tome',
  },
  waterMoonPick: {
    id: 'waterMoonPick', category: 'boss',
    name: { ru: 'Кирка Водяной Луны', en: 'Water Moon Pick' },
    farm: { ru: 'Охота на аномалию «Король ритма»', en: 'Anomaly Hunt "Beat King"' },
    originalFarmName: 'Beat King',
  },
  nestGuardFragment: {
    id: 'nestGuardFragment', category: 'boss',
    name: { ru: 'Фрагмент Стража Гнезда', en: 'Nest Guard Fragment' },
    farm: { ru: 'Охота на аномалию «Прикованная к гнезду птица»', en: 'Anomaly Hunt "Nestbound Bird"' },
    originalFarmName: 'Nestbound Bird',
  },
  colorfulTicketStub: {
    id: 'colorfulTicketStub', category: 'boss',
    name: { ru: 'Красочный билетный корешок', en: 'Colorful Ticket Stub' },
    farm: { ru: 'Охота на аномалию «Махаон»', en: 'Anomaly Hunt "Swallowtail"' },
    originalFarmName: 'Swallowtail',
  },
  tearOfTheSea: {
    id: 'tearOfTheSea', category: 'boss',
    name: { ru: 'Слеза моря', en: 'Tear of the Sea' },
    farm: { ru: 'Охота на аномалию «Морской узник»', en: 'Anomaly Hunt "Sea Prisoner"' },
    originalFarmName: 'Sea Prisoner',
  },
  confessionalFlowerSeed: {
    id: 'confessionalFlowerSeed', category: 'boss',
    name: { ru: 'Семя цветка исповеди', en: 'Confessional Flower Seed' },
    farm: { ru: 'Охота на аномалию «Серенетти»', en: 'Anomaly Hunt "Serenetti"' },
    originalFarmName: 'Serenetti',
  },
};

const whispers = ['lostWhispers', 'obscureWhispers', 'paradoxicalWhispers'] as const;
const silhouettes = ['fadingSilhouette', 'blurredSilhouette', 'chaosSilhouette'] as const;
const numerals = ['blurredNumeral', 'unsolvedNumeral', 'distortedNumeral'] as const;
const delusions = ['suspendedDelusions', 'yearningDelusions', 'transcendentDelusions'] as const;
const verifiedAt = '2026-08-04';
const icy = 'Icy Veins';

function profile(
  characterName: string,
  commonMaterials: CharacterAscensionProfile['commonMaterials'],
  bossMaterial: AscensionMaterialId,
  sourceUpdatedAt: string,
): CharacterAscensionProfile {
  const slug = characterName === 'Daffodill' ? 'daffodill' : characterName.toLowerCase();
  return {
    characterName,
    commonMaterials,
    bossMaterial,
    sourcePublisher: icy,
    sourceUrl: `https://www.icy-veins.com/neverness-to-everness/${slug}-profile-skills`,
    sourceUpdatedAt,
    verifiedAt,
  };
}

export const characterAscensionProfiles: CharacterAscensionProfile[] = [
  profile('Adler', numerals, 'waterMoonPick', '2026-07-28'),
  profile('Aurelia', delusions, 'nestGuardFragment', '2026-07-28'),
  profile('Baicang', numerals, 'nestGuardFragment', '2026-07-28'),
  profile('Chaos', delusions, 'tearOfTheSea', '2026-07-28'),
  profile('Chiz', whispers, 'tearOfTheSea', '2026-06-11'),
  profile('Daffodill', delusions, 'chargingKnightSparkPlug', '2026-07-28'),
  profile('Edgar', whispers, 'colorfulTicketStub', '2026-07-28'),
  profile('Fadia', silhouettes, 'waterMoonPick', '2026-07-28'),
  profile('Haniel', numerals, 'nestGuardFragment', '2026-07-28'),
  profile('Hathor', delusions, 'colorfulTicketStub', '2026-06-27'),
  profile('Hotori', whispers, 'confessionalFlowerSeed', '2026-07-01'),
  profile('Iroi', silhouettes, 'pageDelusionsShore', '2026-07-27'),
  profile('Jiuyuan', silhouettes, 'tearOfTheSea', '2026-07-28'),
  profile('Lacrimosa', whispers, 'confessionalFlowerSeed', '2026-07-28'),
  profile('Mint', silhouettes, 'pageDelusionsShore', '2026-07-28'),
  profile('Nanally', silhouettes, 'pageDelusionsShore', '2026-07-31'),
  profile('Sakiri', numerals, 'chargingKnightSparkPlug', '2026-07-28'),
  profile('Shinku', whispers, 'chargingKnightSparkPlug', '2026-07-31'),
  profile('Skia', delusions, 'confessionalFlowerSeed', '2026-07-28'),
  profile('Zero', whispers, 'chargingKnightSparkPlug', '2026-07-28'),
];

export const characterAscensionByName = new Map(characterAscensionProfiles.map((entry) => [entry.characterName, entry]));
export const ascensionMaterialIds = Object.keys(ascensionMaterials) as AscensionMaterialId[];
export const bossMaterialIds = ascensionMaterialIds.filter((id) => ascensionMaterials[id].category === 'boss');
export const commonMaterialIds = ascensionMaterialIds.filter((id) => ascensionMaterials[id].category === 'common');

export const progressionDatasetSources = [
  {
    publisher: 'Icy Veins',
    url: 'https://www.icy-veins.com/neverness-to-everness/iroi-profile-skills',
    updatedAt: '2026-07-27',
    verifiedAt,
    scope: {
      ru: 'Точная стоимость шести этапов возвышения и структура материалов на странице персонажа; эта же кривая сверена по страницам всех 20 доступных персонажей.',
      en: 'Exact six-step ascension costs and material structure from character profile pages; the same curve was cross-checked across all 20 released characters.',
    },
  },
  {
    publisher: 'Neverness.gg',
    url: 'https://neverness.gg/materials/',
    updatedAt: '2026-05-14',
    verifiedAt,
    scope: {
      ru: 'Сводная привязка семейств материалов, босс-дропов и источников фарма; более новые персонажи дополнительно проверены по прямым страницам Icy Veins.',
      en: 'Aggregate mapping of material families, boss drops and farming sources; newer characters were additionally verified against direct Icy Veins profile pages.',
    },
  },
] as const;
