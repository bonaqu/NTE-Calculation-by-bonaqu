import type { RotationPreset } from './types';

const verifiedAt = '2026-08-04';
const publisher = 'Prydwen Institute';

export const rotationPresets: RotationPreset[] = [
  {
    id: 'shinku-charge',
    title: { ru: 'Синку · команда Заряда', en: 'Shinku · Charge team' },
    description: {
      ru: 'Ротация вокруг длинного окна сверхспособности Синку. Ремора подготавливается Хатор, Оценщик быстро заполняет шкалу цикла, а Наналли запускает Цветение и Заряд перед выходом Синку.',
      en: 'A rotation built around Shinku long Ultimate window. Hathor prepares Remora, Zero fills the Cycle gauge, and Nanally triggers Blossom and Charge before Shinku takes the field.',
    },
    team: ['Shinku', 'Hathor', 'Zero', 'Nanally'],
    cyclePlan: ['remora', 'blossom', 'charge'],
    assumptions: [
      {
        ru: 'Если шкала цикла эспера не готова, сначала набери её Синку: потрать 8 зарядов навыка, затем ещё 4 заряда навыком или контратакой после идеального уклонения.',
        en: 'If the Esper Cycle gauge is not ready, prepare it on Shinku first by spending 8 skill stacks, then 4 more through Skill or a dodge counter.',
      },
      {
        ru: 'Главная цель окна Синку — выполнить 5 усиленных навыков и 3 рывка сверхспособности до завершающего удара.',
        en: 'The main execution target is 5 enhanced Skills and 3 Ultimate dashes before the finisher.',
      },
      {
        ru: 'Источник не публикует точную длительность каждого действия. Страница показывает порядок действий, а не воспроизводимую точную временную шкалу.',
        en: 'The source does not publish exact action durations. This preset represents order and conditions, not a reproducible second-by-second timeline.',
      },
    ],
    steps: [
      {
        id: 'shinku-prep', actor: 'Shinku', phase: 'setup', action: 'prepare', optional: true,
        instruction: {
          ru: 'При необходимости подготовь шкалу цикла: потрать 8 зарядов навыка, затем ещё 4 заряда навыком или контратакой.',
          en: 'If needed, prepare the Cycle gauge by spending 8 Skill stacks, then 4 more through Skill or a dodge counter.',
        },
        outcome: { ru: 'Шкала цикла готова к последовательности Ремора → Цветение → Заряд.', en: 'The Cycle gauge is ready for the Remora → Blossom → Charge sequence.' },
      },
      {
        id: 'hathor-open', actor: 'Hathor', phase: 'setup', action: 'swap', cycle: 'remora',
        instruction: { ru: 'Переключись на Хатор, запусти Ремору, используй сверхспособность и навык перенаправления.', en: 'Swap to Hathor to trigger Remora, then use Ultimate and Redirect Skill.' },
        outcome: { ru: 'На цели действует Ремора; начинается подготовка окна Заряда.', en: 'Remora is active on the target and the Charge setup begins.' },
      },
      {
        id: 'zero-fill', actor: 'Zero', phase: 'setup', action: 'skill',
        instruction: { ru: 'Во время анимации навыка Хатор переключись на Оценщика, используй сверхспособность, затем навык.', en: 'During Hathor Skill animation, swap to Zero, use Ultimate, then Skill.' },
        outcome: { ru: 'Навык Оценщика быстро заполняет шкалу цикла эспера для следующего переключения.', en: 'Zero Skill rapidly fills the Esper Cycle gauge for the next swap.' },
      },
      {
        id: 'nanally-charge', actor: 'Nanally', phase: 'setup', action: 'swap', cycle: 'blossom',
        instruction: { ru: 'Во время навыка Оценщика переключись на Наналли, запусти Цветение и Заряд, затем используй сверхспособность и навык перенаправления.', en: 'During Zero Skill, swap to Nanally to trigger Blossom and Charge, then use Ultimate and Redirect Skill.' },
        outcome: { ru: 'Цветение попадает по цели с Реморой и запускает Заряд.', en: 'Blossom reaches the Remora target and activates Charge.' },
      },
      {
        id: 'shinku-ultimate', actor: 'Shinku', phase: 'burst', action: 'ultimate', cycle: 'charge',
        instruction: { ru: 'Во время навыка Наналли переключись на Синку и сразу используй сверхспособность.', en: 'Swap to Shinku during Nanally Skill and activate Ultimate immediately.' },
        outcome: { ru: 'Синку получает активное окно Заряда во время состояния сверхспособности.', en: 'Shinku receives the Charge window while entering the Ultimate state.' },
      },
      {
        id: 'shinku-enhanced-skills', actor: 'Shinku', phase: 'burst', action: 'basic',
        instruction: { ru: 'Сделай 1–2 базовые атаки до заполнения шкалы усиленного навыка, используй его и повтори цикл, пока не выполнишь 5 усиленных навыков.', en: 'Use 1–2 Basic Attacks until the enhanced Skill gauge fills, cast it, and repeat until 5 enhanced Skills are completed.' },
        outcome: { ru: 'Основная часть урона Синку укладывается в окно сверхспособности.', en: 'The main portion of Shinku damage is delivered inside the Ultimate window.' },
      },
      {
        id: 'shinku-dashes', actor: 'Shinku', phase: 'burst', action: 'skill',
        instruction: { ru: 'Используй 3 доступных рывка сверхспособности, чтобы перейти к завершающему удару.', en: 'Use the 3 available Ultimate dashes to reach the finishing attack.' },
        outcome: { ru: 'Завершается основное окно урона ротации.', en: 'The main burst window reaches its finisher.' },
      },
      {
        id: 'shinku-recovery', actor: 'Shinku', phase: 'recovery', action: 'recovery',
        instruction: { ru: 'После выхода из сверхспособности набери 8 зарядов, используй навык и переключись на следующего персонажа.', en: 'After leaving Ultimate, build 8 stacks, use Skill, and swap out.' },
        outcome: { ru: 'Подготовлен следующий цикл; повтори последовательность с Хатор.', en: 'The next Cycle is prepared; restart the sequence from Hathor.' },
      },
    ],
    sourcePublisher: publisher,
    sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/characters/shinku',
    sourceUpdatedAt: '2026-07-13',
    verifiedAt,
    timingPolicy: {
      ru: 'Показывается подтверждённый порядок действий. Точные секунды и DPS не рассчитываются: источник не публикует полную временную шкалу анимаций.',
      en: 'The sourced action order is shown. Exact seconds and DPS are not derived because the source does not publish a complete animation timeline.',
    },
  },
  {
    id: 'hathor-hyper',
    title: { ru: 'Хатор · основной урон', en: 'Hathor · Hypercarry' },
    description: {
      ru: 'Ротация Хатор через Цветение, След, Ремору и Заряд. Цзююань и Оценщик подготавливают цикл, Ханиэль даёт усиления, а Хатор тратит накопленные перья в состоянии «Срочная доставка».',
      en: 'A Hathor rotation through Blossom, Stain, Remora and Charge. Jiuyuan and Zero prepare the Cycle, Haniel supplies buffs, and Hathor spends stored feathers during Emergency Delivery.',
    },
    team: ['Hathor', 'Jiuyuan', 'Zero', 'Haniel'],
    cyclePlan: ['blossom', 'stain', 'remora', 'charge'],
    assumptions: [
      {
        ru: 'Порядок рассчитан на полностью удержанный навык перенаправления Хатор и 3 усиленных «Удара циклона» после сверхспособности.',
        en: 'The sequence assumes a fully held Hathor Redirect Skill and 3 enhanced Cyclone Strikes after Ultimate.',
      },
      {
        ru: 'Если энергия Хатор уже заполнена после второго Заряда, энергию реакции можно передать Ханиэль.',
        en: 'If Hathor Ultimate Energy is already full after the second Charge, the reaction energy can be routed to Haniel.',
      },
      {
        ru: 'Порядок подтверждён гайдом, но длительность анимаций, задержки переключений и поведение конкретного босса остаются пользовательскими условиями.',
        en: 'The order is sourced, while animation length, swap delay, and boss-specific behavior remain user conditions.',
      },
    ],
    steps: [
      {
        id: 'jiuyuan-open', actor: 'Jiuyuan', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Начни Цзююань: используй сверхспособность «Расплата» и навык перенаправления.', en: 'Start on Jiuyuan with Final Reckoning and her Redirect Skill.' },
        outcome: { ru: 'Цзююань подготавливает компонент Анимы для Цветения.', en: 'Jiuyuan prepares the Anima side of Blossom.' },
      },
      {
        id: 'zero-blossom', actor: 'Zero', phase: 'setup', action: 'swap', cycle: 'blossom',
        instruction: { ru: 'Переключись на Оценщика, запусти Цветение и используй сверхспособность.', en: 'Swap to Zero to trigger Blossom, then use Ultimate.' },
        outcome: { ru: 'Цветение активно, а Оценщик готовит дальнейшее заполнение шкалы.', en: 'Blossom is active and Zero prepares the next Cycle fill.' },
      },
      {
        id: 'haniel-buffs', actor: 'Haniel', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Переключись на Ханиэль, используй навык перенаправления и сверхспособность, чтобы активировать её усиления ATK; при полном резонансе также действует прибавка крит. урона.', en: 'Swap to Haniel, use Redirect Skill and Ultimate to activate her ATK buffs; full Resonance also adds CRIT DMG.' },
        outcome: { ru: 'Командные усиления подготовлены перед выходом Хатор.', en: 'Team buffs are active before Hathor takes the field.' },
      },
      {
        id: 'hathor-stain', actor: 'Hathor', phase: 'setup', action: 'redirect', cycle: 'stain',
        instruction: { ru: 'Переключись на Хатор, запусти След и полностью удерживай «Воздушное командование», чтобы набрать перья.', en: 'Swap to Hathor to trigger Stain, then fully hold Aerial Command to gain feathers.' },
        outcome: { ru: 'След усиливает урон Лакшаны, а Хатор получает ресурс для «Удара циклона».', en: 'Stain amplifies Lakshana damage and Hathor gains resources for Cyclone Strike.' },
      },
      {
        id: 'hathor-quickswap', actor: 'Zero', phase: 'setup', action: 'swap',
        instruction: { ru: 'Быстро переключись с Хатор на Оценщика и сразу приготовь возврат на Хатор.', en: 'Quick-swap from Hathor to Zero and prepare to return immediately.' },
        outcome: { ru: 'Создаётся правильный порядок атрибутов для Реморы и Заряда.', en: 'The attribute order is prepared for Remora and Charge.' },
      },
      {
        id: 'hathor-charge', actor: 'Hathor', phase: 'burst', action: 'swap', cycle: 'remora',
        instruction: { ru: 'Вернись на Хатор, чтобы запустить Ремору и затем Заряд.', en: 'Return to Hathor to trigger Remora and then Charge.' },
        outcome: { ru: 'Хатор получает энергию Заряда и входит в усиленное окно.', en: 'Hathor receives Charge energy and enters the prepared burst window.' },
      },
      {
        id: 'hathor-ultimate', actor: 'Hathor', phase: 'burst', action: 'ultimate', cycle: 'charge',
        instruction: { ru: 'Сразу используй «Быстрый скакун», активируй «Срочную доставку» и выполни 3 усиленных «Удара циклона».', en: 'Immediately use Rider Express, enter Emergency Delivery, and perform 3 enhanced Cyclone Strikes.' },
        outcome: { ru: 'Хатор тратит накопленные перья в основном окне урона.', en: 'Hathor spends the stored feathers during her main damage window.' },
      },
      {
        id: 'zero-third-strike', actor: 'Zero', phase: 'recovery', action: 'redirect',
        instruction: { ru: 'Во время анимации третьего «Удара циклона» переключись на Оценщика и используй навык перенаправления.', en: 'During the third Cyclone Strike animation, swap to Zero and use Redirect Skill.' },
        outcome: { ru: 'Оценщик быстро подготавливает следующую реакцию.', en: 'Zero rapidly prepares the next reaction.' },
      },
      {
        id: 'jiuyuan-second-charge', actor: 'Jiuyuan', phase: 'recovery', action: 'swap', cycle: 'blossom',
        instruction: { ru: 'Переключись на Цзююань, снова запусти Цветение и последующий Заряд.', en: 'Swap to Jiuyuan to trigger Blossom and the following Charge again.' },
        outcome: { ru: 'Второй Заряд создаёт дополнительное окно восстановления энергии.', en: 'A second Charge creates another Ultimate Energy recovery window.' },
      },
      {
        id: 'energy-routing', actor: 'Hathor', phase: 'recovery', action: 'recovery', cycle: 'charge',
        instruction: { ru: 'Вернись на Хатор, чтобы получить энергию реакции. Если её энергия уже полна, переключись на Ханиэль.', en: 'Return to Hathor to absorb the reaction energy. If her Energy is full, route it to Haniel instead.' },
        outcome: { ru: 'Энергия направляется персонажу, которому она нужнее для следующего цикла.', en: 'The reaction Energy is routed to the character who needs it for the next loop.' },
      },
      {
        id: 'haniel-rebuild', actor: 'Haniel', phase: 'recovery', action: 'recovery',
        instruction: { ru: 'Восстанови энергию и шкалу цикла эспера на Ханиэль, затем повтори ротацию с Цзююань.', en: 'Rebuild Energy and the Esper Cycle gauge on Haniel, then restart from Jiuyuan.' },
        outcome: { ru: 'Команда возвращается к началу последовательности.', en: 'The team returns to the start of the sequence.' },
      },
    ],
    sourcePublisher: publisher,
    sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/characters/hathor',
    sourceUpdatedAt: '2026-06-23',
    verifiedAt,
    timingPolicy: {
      ru: 'Показывается подтверждённый порядок и условия переключений. Точная временная шкала не заявляется как официальная.',
      en: 'The sourced order and swap conditions are shown. A second-by-second timeline is not presented as official.',
    },
  },
];

export const rotationPresetById = new Map(rotationPresets.map((preset) => [preset.id, preset]));
