import type { LocalizationEvidenceLevel } from './localization-evidence';
import type { Locale, LocalizedText } from './types';

export type CharacterTermKind =
  | 'basic'
  | 'charged'
  | 'redirect'
  | 'ultimate'
  | 'passive'
  | 'state'
  | 'resource'
  | 'mark'
  | 'sub-action'
  | 'qte'
  | 'companion'
  | 'effect'
  | 'coverage';

export type CharacterTermResolution = 'exact' | 'conflicted' | 'unresolved';

export interface CharacterTermAlternative {
  russian: string;
  english?: string;
  note: LocalizedText;
}

export interface CharacterTermRecord {
  id: string;
  characterName: string;
  kind: CharacterTermKind;
  russian: string;
  english: string;
  resolution: CharacterTermResolution;
  level: LocalizationEvidenceLevel;
  sourcePublisher: string;
  sourceUrl?: string;
  supportingSourceUrl?: string;
  verifiedAt: string;
  aliases?: readonly string[];
  alternatives?: readonly CharacterTermAlternative[];
  note: LocalizedText;
}

type CharacterTermExtra = Partial<Pick<CharacterTermRecord, 'aliases' | 'alternatives' | 'resolution'>>;

const verifiedAt = '2026-08-04';
const publisher = 'NTE Neverness to Everness Database';
const db = (locale: 'ru' | 'en', id: number) => `https://interactivemap.app/neverness-to-everness/database/${locale}/espers/esper-${id}/`;

const exact = (
  id: string,
  characterName: string,
  kind: CharacterTermKind,
  russian: string,
  english: string,
  esperId: number,
  note?: LocalizedText,
  extra?: CharacterTermExtra,
): CharacterTermRecord => ({
  id,
  characterName,
  kind,
  russian,
  english,
  resolution: extra?.resolution ?? 'exact',
  level: 'current-russian-reference',
  sourcePublisher: publisher,
  sourceUrl: db('ru', esperId),
  supportingSourceUrl: db('en', esperId),
  verifiedAt,
  ...(extra?.aliases ? { aliases: extra.aliases } : {}),
  ...(extra?.alternatives ? { alternatives: extra.alternatives } : {}),
  note: note ?? {
    ru: 'Русское и английское названия сопоставлены по текущим карточкам игровых данных. Источник является фанатской выгрузкой и не объявляется официальным.',
    en: 'Russian and English labels are paired from current game-data records. The source is a fan transcription and is not presented as official.',
  },
});

const unresolved = (characterName: string, note: LocalizedText): CharacterTermRecord => ({
  id: `${characterName.toLowerCase()}.coverage.unresolved`,
  characterName,
  kind: 'coverage',
  russian: 'Точные русские названия навыков не подтверждены',
  english: 'Exact Russian skill labels unresolved',
  resolution: 'unresolved',
  level: 'project-fallback',
  sourcePublisher: 'NTE Calculation by bonaqu',
  verifiedAt,
  note,
});

export const characterTerms: readonly CharacterTermRecord[] = [
  exact('hathor.basic.rapid-delivery', 'Hathor', 'basic', 'Быстрая доставка', 'Rapid Delivery', 1025),
  exact('hathor.redirect.aerial-command', 'Hathor', 'redirect', 'Воздушное командование', 'Aerial Command', 1025),
  exact('hathor.sub-action.cyclone-strike', 'Hathor', 'sub-action', 'Удар циклона', 'Cyclone Strike', 1025),
  exact('hathor.ultimate.rider-express', 'Hathor', 'ultimate', 'Быстрый скакун', 'Rider Express', 1025),
  exact('hathor.state.emergency-delivery', 'Hathor', 'state', 'Срочная доставка', 'Emergency Delivery', 1025),
  exact('hathor.resource.express-delivery-power', 'Hathor', 'resource', 'Сила экспресс-доставки', 'Express Delivery Power', 1025),
  exact('hathor.mark.five-star-tracking', 'Hathor', 'mark', 'Пятизвездочное отслеживание', 'Five-Star Tracking', 1025),
  exact('hathor.passive.delay-warning', 'Hathor', 'passive', 'Предупреждение о задержке', 'Delay Warning', 1025),
  exact('hathor.passive.efficiency-boost', 'Hathor', 'passive', 'Повышение эффективности', 'Efficiency Boost', 1025),

  exact('haniel.basic.genesse-technique', 'Haniel', 'basic', 'Техника Генесс', 'Genesse Technique', 1020, undefined, {
    aliases: ['Техники Генесса'],
  }),
  exact('haniel.charged.paranormal-cannon', 'Haniel', 'charged', 'Паранормальная пушка', 'Paranormal Cannon', 1020),
  exact('haniel.redirect.silent-moonlit-forest-guardian', 'Haniel', 'redirect', 'Хранитель лунного леса', 'Silent Moonlit Forest Guardian', 1020),
  exact('haniel.ultimate.melody-named-haniel', 'Haniel', 'ultimate', 'Мелодия в честь Ханиэль', 'A Melody Named Haniel', 1020),
  exact('haniel.state.paranormal-ace', 'Haniel', 'state', 'Паранормальный ас', 'Paranormal Ace', 1020),
  exact('haniel.resource.four-note-chord', 'Haniel', 'resource', 'Аккорд из четырех нот', 'Four-Note Chord', 1020),
  exact('haniel.effect.ensemble', 'Haniel', 'effect', 'Ансамбль', 'Ensemble', 1020),
  exact('haniel.effect.plot-armor', 'Haniel', 'effect', 'Сюжетная броня', 'Plot Armor', 1020),
  exact('haniel.companion.hootie', 'Haniel', 'companion', 'Филя', 'Hootie', 1020),
  exact('haniel.qte.easter-eggs', 'Haniel', 'qte', 'Пасхалки', 'Easter Eggs', 1020),
  exact('haniel.passive.friendship-wins', 'Haniel', 'passive', 'Победила дружба!', 'Friendship Wins!', 1020),
  exact('haniel.passive.soul-bond', 'Haniel', 'passive', 'Связь душ!', 'Soul Bond!', 1020),

  exact('jiuyuan.basic.when-secrets-take-shape', 'Jiuyuan', 'basic', 'Когда тайны обретают форму', 'When Secrets Take Shape', 1055),
  exact('jiuyuan.redirect.intel-hunter', 'Jiuyuan', 'redirect', 'Охотник за разведданными', 'Intel Hunter', 1055),
  exact('jiuyuan.ultimate.final-reckoning', 'Jiuyuan', 'ultimate', 'Расплата', 'Final Reckoning', 1055),
  exact('jiuyuan.resource.rose-pact-bullets', 'Jiuyuan', 'resource', 'Пули договора розы', 'Rose Pact Bullets', 1055),
  exact('jiuyuan.mark.rose-pact', 'Jiuyuan', 'mark', 'Смертоносный договор розы', 'Fatal Rose Pact', 1055, {
    ru: 'Одна и та же текущая карточка использует два русских и два английских варианта. Основная пара сохранена вместе с конфликтом; автоматическое скрытое исправление запрещено.',
    en: 'The same current record uses two Russian and two English variants. The primary pair is retained with the conflict disclosed; silent normalization is forbidden.',
  }, {
    resolution: 'conflicted',
    alternatives: [{
      russian: 'Фатальный договор розы',
      english: 'Lethal Rose Pact',
      note: {
        ru: 'Альтернативная форма встречается в другом фрагменте той же карточки.',
        en: 'An alternate form appears in another section of the same record.',
      },
    }],
  }),
  exact('jiuyuan.sub-action.contract-settlement', 'Jiuyuan', 'sub-action', 'Заключение договора', 'Contract Settlement', 1055),
  exact('jiuyuan.passive.seize-the-moment', 'Jiuyuan', 'passive', 'Ловите момент', 'Seize the Moment', 1055),
  exact('jiuyuan.passive.whispers-under-my-command', 'Jiuyuan', 'passive', 'Подвластный мне шёпот', 'Whispers Under My Command', 1055),

  exact('nanally.basic.colucci-secret-skill', 'Nanally', 'basic', 'Тайный навык Колуччи', 'Colucci Secret Skill', 1041),
  exact('nanally.redirect.colucci-howling-technique', 'Nanally', 'redirect', 'Техника воя Колуччи', 'Colucci Howling Technique', 1041),
  exact('nanally.ultimate.colucci-ultimate-technique', 'Nanally', 'ultimate', 'Ультимативная техника Колуччи', 'Colucci Ultimate Technique', 1041),
  exact('nanally.state.ichi-daime-authority', 'Nanally', 'state', 'Авторитет Ити-дайме', "Ichi-daime's Authority", 1041),
  exact('nanally.companion.underboss', 'Nanally', 'companion', 'Младший босс', 'Underboss', 1041),
  exact('nanally.qte.justice-from-above', 'Nanally', 'qte', 'Правосудие свыше', 'Justice from Above', 1041),
  exact('nanally.passive.more-than-passionate', 'Nanally', 'passive', 'Больше, чем страсть', 'More Than Passionate', 1041),
  exact('nanally.passive.fair-duel', 'Nanally', 'passive', 'Честная дуэль', 'Fair Duel', 1041),

  exact('sakiri.basic.kirumaru-headbutt', 'Sakiri', 'basic', 'Удар головой Кирумару', 'Kirumaru Headbutt', 1003),
  exact('sakiri.redirect.swallow-whole', 'Sakiri', 'redirect', 'Поглощение целиком', 'Swallow Whole', 1003),
  exact('sakiri.ultimate.feast-of-gluttony', 'Sakiri', 'ultimate', 'Праздник обжорства', 'Feast of Gluttony', 1003),
  exact('sakiri.qte.crusher', 'Sakiri', 'qte', 'Давилка!', 'Crusher!', 1003),
  exact('sakiri.state.eating-mode', 'Sakiri', 'state', 'Режим поедания', 'Eating Mode', 1003),
  exact('sakiri.companion.kirumaru', 'Sakiri', 'companion', 'Кирумару', 'Kirumaru', 1003),
  exact('sakiri.passive.can-this-be-eaten', 'Sakiri', 'passive', 'Это можно есть?', 'Can This Be Eaten?', 1003),
  exact('sakiri.passive.mischievous-trick', 'Sakiri', 'passive', 'Озорной трюк', 'Mischievous Trick', 1003),

  exact('zero.basic.appraisal', 'Zero', 'basic', 'Оценка', 'Appraisal', 1051),
  exact('zero.redirect.appraise-and-engrave', 'Zero', 'redirect', 'Оценка и гравировка', 'Appraise and Engrave', 1051),
  exact('zero.ultimate.divide-by-zero', 'Zero', 'ultimate', 'Деление на ноль', 'Divide by Zero', 1051),
  exact('zero.passive.appraiser', 'Zero', 'passive', 'Оценщик', 'Appraiser', 1051, {
    ru: '«Оценщик» подтверждён как название пассивного навыка и сюжетное обращение. Это не основное имя персонажа, которое остаётся «Зеро».',
    en: '“Appraiser” is confirmed as a passive and contextual title. It is not the character primary name, which remains Zero.',
  }),
  exact('zero.passive.anomaly-perception', 'Zero', 'passive', 'Восприятие аномалий', 'Anomaly Perception', 1051),

  exact('adler.basic.deliverance', 'Adler', 'basic', 'Избавление', 'Deliverance', 1033),
  exact('adler.redirect.evils-bane', 'Adler', 'redirect', 'Проклятие зла', "Evil's Bane", 1033),
  exact('adler.ultimate.tranquility', 'Adler', 'ultimate', 'Спокойствие', 'Tranquility', 1033),
  exact('adler.resource.karma', 'Adler', 'resource', 'Карма', 'Karma', 1033),
  exact('adler.effect.blessing', 'Adler', 'effect', 'Благословение', 'Blessing', 1033),
  exact('adler.passive.temperance', 'Adler', 'passive', 'Умеренность', 'Temperance', 1033),
  exact('adler.passive.righteous-heart', 'Adler', 'passive', 'Распознание', 'Righteous Heart', 1033, {
    ru: 'Русская и английская подписи семантически не буквальны, но относятся к одной позиции пассивного навыка в параллельных карточках.',
    en: 'The Russian and English labels are not literal equivalents but occupy the same passive slot in the parallel records.',
  }),

  exact('daffodill.basic.still-waters', 'Daffodill', 'basic', 'Спокойные воды', 'Still Waters', 1054),
  exact('daffodill.redirect.resonance', 'Daffodill', 'redirect', 'Резонанс', 'Resonance', 1054),
  exact('daffodill.ultimate.witness-this-finale', 'Daffodill', 'ultimate', 'Узри этот финал', 'Witness This Finale', 1054),
  exact('daffodill.sub-action.phantom-step', 'Daffodill', 'sub-action', 'Призрачный шаг', 'Phantom Step', 1054),
  exact('daffodill.effect.insight', 'Daffodill', 'effect', 'Проницательность', 'Insight', 1054),
  exact('daffodill.resource.finale', 'Daffodill', 'resource', 'Финал', 'Finale', 1054),

  exact('lacrimosa.basic.sweet-and-sour', 'Lacrimosa', 'basic', 'Сладкое и кислое', 'Sweet and Sour', 1004),
  exact('lacrimosa.redirect.morning-tomato', 'Lacrimosa', 'redirect', 'Утренний томат', 'Morning Tomato', 1004),
  exact('lacrimosa.ultimate.devilish-gift', 'Lacrimosa', 'ultimate', 'Дьявольский подарок', 'Devilish Gift', 1004),
  exact('lacrimosa.qte.working-day-judgement', 'Lacrimosa', 'qte', 'Приговор рабочего дня', 'Working Day Judgement', 1004),
  exact('lacrimosa.effect.nightmare', 'Lacrimosa', 'effect', 'Кошмар', 'Nightmare', 1004),
  exact('lacrimosa.sub-action.tomato-metal', 'Lacrimosa', 'sub-action', 'Томатный металл', 'Tomato Metal', 1004),
  exact('lacrimosa.sub-action.tomato-percussion', 'Lacrimosa', 'sub-action', 'Томатная перкуссия', 'Tomato Percussion', 1004),
  exact('lacrimosa.passive.clock-out-clemency', 'Lacrimosa', 'passive', 'Отсроченное милосердие', 'Clock Out Clemency', 1004),
  exact('lacrimosa.passive.rise-and-shine', 'Lacrimosa', 'passive', 'Проснись и пой', 'Rise and Shine', 1004),
  exact('lacrimosa.passive.molten-ice-cream', 'Lacrimosa', 'passive', 'Расплавленное мороженое', 'Molten Ice Cream', 1004),
  exact('lacrimosa.passive.almighty-lord-of-tomatoes', 'Lacrimosa', 'passive', 'Всемогущий повелитель томатов', 'Almighty Lord of Tomatoes', 1004),
  exact('lacrimosa.passive.tempered-glass-judgement', 'Lacrimosa', 'passive', 'Приговор закалённого стекла', 'Tempered Glass Judgement', 1004),
  exact('lacrimosa.passive.morning-spell', 'Lacrimosa', 'passive', 'Утреннее заклинание', 'Morning Spell', 1004),

  unresolved('Shinku', {
    ru: 'Для Шинку найден актуальный английский гайд с порядком действий, но не найдена достаточно надёжная текущая русская карточка всех уникальных навыков. Ротация сохраняет типы действий и количественные условия без выдуманных названий.',
    en: 'A current English action guide exists for Shinku, but no sufficiently reliable current Russian card for all unique skills was found. The rotation retains action types and numeric conditions without invented labels.',
  }),
  unresolved('Chaos', {
    ru: 'Текущий гайд подтверждает порядок действий Хаос, но точные русские названия её навыков и уникальной метки пока не повышаются до основных терминов без русской клиентской карточки.',
    en: 'The current guide supports Chaos action order, while exact Russian skill and mark labels remain unresolved without a Russian client-data card.',
  }),
  unresolved('Baicang', {
    ru: 'Для Байканг подтверждён порядок ротации, но точные русские названия уникальных атак и ресурсов не найдены в достаточно полном текущем источнике.',
    en: 'Baicang rotation order is sourced, but exact Russian names for unique attacks and resources were not found in a sufficiently complete current source.',
  }),
];

export const characterTermById = new Map(characterTerms.map((term) => [term.id, term]));

export const characterTermCoverage = new Map<string, CharacterTermResolution>(
  [...new Set(characterTerms.map((term) => term.characterName))].map((characterName) => {
    const terms = characterTerms.filter((term) => term.characterName === characterName);
    const resolution: CharacterTermResolution = terms.some((term) => term.resolution === 'exact' || term.resolution === 'conflicted')
      ? 'exact'
      : 'unresolved';
    return [characterName, resolution];
  }),
);

export function characterTermKindLabel(kind: CharacterTermKind, locale: Locale): string {
  const labels: Record<CharacterTermKind, LocalizedText> = {
    basic: { ru: 'Базовая атака', en: 'Basic Attack' },
    charged: { ru: 'Заряженная атака', en: 'Charged Attack' },
    redirect: { ru: 'Навык перенаправления', en: 'Redirect Skill' },
    ultimate: { ru: 'Сверхспособность', en: 'Ultimate' },
    passive: { ru: 'Пассивный навык', en: 'Passive' },
    state: { ru: 'Состояние', en: 'State' },
    resource: { ru: 'Ресурс', en: 'Resource' },
    mark: { ru: 'Метка', en: 'Mark' },
    'sub-action': { ru: 'Именное действие', en: 'Named action' },
    qte: { ru: 'Навык поддержки', en: 'Support Skill' },
    companion: { ru: 'Спутник / призыв', en: 'Companion / summon' },
    effect: { ru: 'Именной эффект', en: 'Named effect' },
    coverage: { ru: 'Статус покрытия', en: 'Coverage status' },
  };
  return labels[kind][locale];
}

export function normalizeCharacterTermSearch(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/gu, 'е').replace(/[’‘`]/gu, "'").replace(/\s+/gu, ' ').trim();
}

export function searchCharacterTerms(query: string): CharacterTermRecord[] {
  const normalized = normalizeCharacterTermSearch(query);
  if (!normalized) return [...characterTerms];
  return characterTerms.filter((term) => [
    term.id,
    term.characterName,
    term.russian,
    term.english,
    ...(term.aliases ?? []),
    ...(term.alternatives ?? []).flatMap((alternative) => [alternative.russian, alternative.english ?? '']),
  ].some((value) => normalizeCharacterTermSearch(value).includes(normalized)));
}