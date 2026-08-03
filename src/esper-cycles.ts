import type { EsperCycleDefinition, EsperCycleId, Locale } from './types';

const sourcePublisher = 'Prydwen Institute';
const sourceUrl = 'https://www.prydwen.gg/neverness-to-everness/guides/esper-cycles';
const sourceUpdatedAt = '2026-04-23';
const verifiedAt = '2026-08-03';

function cycle(definition: Omit<EsperCycleDefinition, 'sourcePublisher' | 'sourceUrl' | 'sourceUpdatedAt' | 'verifiedAt'>): EsperCycleDefinition {
  return { ...definition, sourcePublisher, sourceUrl, sourceUpdatedAt, verifiedAt };
}

export const esperCycles: EsperCycleDefinition[] = [
  cycle({
    id: 'blossom',
    name: { ru: 'Цветение', en: 'Blossom' },
    category: 'pair',
    attributes: ['Anima', 'Cosmos'],
    effect: {
      ru: 'Создаёт бутон возле цели. Он выпускает пять лепестков, которые каждые 2 секунды летят к врагам и наносят урон по области. Одновременно может существовать до трёх бутонов.',
      en: 'Creates a Vita Bud near the target. It releases five pistils that travel to enemies every 2 seconds and deal area damage. Up to three buds can exist at once.',
    },
  }),
  cycle({
    id: 'remora',
    name: { ru: 'Ремора', en: 'Remora' },
    category: 'pair',
    attributes: ['Cosmos', 'Lakshana'],
    durationSeconds: 5,
    effect: {
      ru: 'На 5 секунд замедляет движение и атаки цели. При повторном наложении длительность постепенно сокращается.',
      en: 'Slows the target movement and attack speed for 5 seconds. Repeated applications have a shorter duration.',
    },
  }),
  cycle({
    id: 'hexed',
    name: { ru: 'Проклятие', en: 'Hexed' },
    category: 'pair',
    attributes: ['Anima', 'Incantation'],
    durationSeconds: 12,
    effect: {
      ru: 'В течение 12 секунд учитывает полученный целью урон Анимы и Заклинания, после чего наносит дополнительный последующий урон.',
      en: 'Records Anima and Incantation damage taken by the target for 12 seconds, then deals additional follow-up damage.',
    },
  }),
  cycle({
    id: 'nova',
    name: { ru: 'Нова', en: 'Nova' },
    category: 'pair',
    attributes: ['Chaos', 'Psyche'],
    durationSeconds: 5,
    effect: {
      ru: 'Накладывает Нову на 5 секунд. Когда эффект заканчивается, цель получает большой ментальный урон.',
      en: 'Applies Nova for 5 seconds. When it expires, the target takes a large instance of Mental damage.',
    },
  }),
  cycle({
    id: 'scorch',
    name: { ru: 'Поджог', en: 'Scorch' },
    category: 'pair',
    attributes: ['Chaos', 'Incantation'],
    durationSeconds: 15,
    effect: {
      ru: 'Накладывает Поджог на 15 секунд и наносит периодический урон.',
      en: 'Applies Scorch for 15 seconds and deals damage over time.',
    },
  }),
  cycle({
    id: 'stain',
    name: { ru: 'След', en: 'Stain' },
    category: 'pair',
    attributes: ['Lakshana', 'Psyche'],
    durationSeconds: 12,
    effect: {
      ru: 'На 12 секунд увеличивает получаемый целью урон Психики и Лакшаны на 20%.',
      en: 'Increases Psyche and Lakshana damage taken by the target by 20% for 12 seconds.',
    },
  }),
  cycle({
    id: 'charge',
    name: { ru: 'Заряд', en: 'Charge' },
    category: 'triple',
    attributes: ['Anima', 'Cosmos', 'Lakshana'],
    derivedFrom: ['blossom', 'remora'],
    effect: {
      ru: 'Когда лепестки Цветения попадают по цели с Реморой, активный персонаж получает 10 дополнительной энергии ультимейта.',
      en: 'When Blossom pistils hit a target affected by Remora, the active character gains 10 additional Ultimate Energy.',
    },
  }),
  cycle({
    id: 'discord',
    name: { ru: 'Дискорд', en: 'Discord' },
    category: 'triple',
    attributes: ['Chaos', 'Incantation', 'Psyche'],
    derivedFrom: ['nova', 'scorch'],
    effect: {
      ru: 'Когда Нова и Поджог действуют одновременно, уменьшает шкалу сломления цели на процентное значение.',
      en: 'When Nova and Scorch are active together, removes a percentage of the target Break gauge.',
    },
  }),
];

export const esperCycleById = new Map<EsperCycleId, EsperCycleDefinition>(esperCycles.map((entry) => [entry.id, entry]));

export function localizedCycleName(id: EsperCycleId, locale: Locale): string {
  return esperCycleById.get(id)?.name[locale] ?? id;
}
