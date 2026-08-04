import type { RotationPreset } from './types';

const verifiedAt = '2026-08-04';
const publisher = 'Prydwen Institute';
const timingPolicy = {
  ru: 'Показывается опубликованный порядок действий и условия переключений. Сайт не назначает действиям секунды и не выводит DPS: источник не публикует полную временную шкалу анимаций.',
  en: 'The published action order and swap conditions are shown. The site assigns no seconds or DPS because the source does not publish a complete animation timeline.',
};
const skillNamePolicy = {
  ru: 'Уникальные названия навыков не переводятся проектом без подтверждённой русской подписи клиента. План использует тип действия и эффект, чтобы не придумывать название.',
  en: 'Unique skill names are not localized by the project without confirmed Russian client wording. The plan uses the action type and effect instead of inventing a name.',
};

export const additionalRotationPresets: RotationPreset[] = [
  {
    id: 'chaos-remora-bomb',
    title: { ru: 'Хаос · взрыв Реморы', en: 'Chaos · Remora Bomb' },
    description: {
      ru: 'Зеро и Хатор накладывают Ремору, Ханиэль подготавливает усиления, а Хаос запускает След и проводит основную последовательность сверхспособности.',
      en: 'Zero and Hathor establish Remora, Haniel prepares team buffs, and Chaos triggers Stain before the main Ultimate sequence.',
    },
    team: ['Chaos', 'Zero', 'Hathor', 'Haniel'],
    cyclePlan: ['remora', 'stain'],
    assumptions: [
      skillNamePolicy,
      {
        ru: 'Навык перенаправления Хатор используется до ухода на перезарядку, после чего Зеро переключением запускает Ремору.',
        en: 'Hathor Redirect Skill is used until it enters cooldown, then swapping to Zero triggers Remora.',
      },
      {
        ru: 'Две усиленные тяжёлые атаки Хаос выполняются после сверхспособности и до возврата на Хатор.',
        en: 'Chaos performs two enhanced Heavy Attacks after Ultimate and before returning to Hathor.',
      },
    ],
    steps: [
      {
        id: 'chaos-hathor-redirect', actor: 'Hathor', phase: 'setup', action: 'redirect',
        instruction: { ru: 'Начни на Хатор и полностью используй навык перенаправления до его перезарядки.', en: 'Start on Hathor and fully use Redirect Skill until it enters cooldown.' },
        outcome: { ru: 'Компонент Лакшаны и ресурсы Хатор готовы к Реморе.', en: 'The Lakshana component and Hathor resources are ready for Remora.' },
      },
      {
        id: 'chaos-zero-remora', actor: 'Zero', phase: 'setup', action: 'swap', cycle: 'remora',
        instruction: { ru: 'Переключись на Зеро, запусти Ремору и используй сверхспособность.', en: 'Swap to Zero, trigger Remora, and use Ultimate.' },
        outcome: { ru: 'На цели действует Ремора; Зеро подготавливает шкалу следующего цикла.', en: 'Remora is active and Zero prepares the next Cycle gauge.' },
      },
      {
        id: 'chaos-haniel-buffs', actor: 'Haniel', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Переключись на Ханиэль, используй навык перенаправления и сверхспособность.', en: 'Swap to Haniel and use Redirect Skill followed by Ultimate.' },
        outcome: { ru: 'Командные усиления АТК готовы к выходу Хаос.', en: 'Team ATK buffs are ready for Chaos.' },
      },
      {
        id: 'chaos-stain', actor: 'Chaos', phase: 'setup', action: 'swap', cycle: 'stain',
        instruction: { ru: 'Переключись на Хаос, запусти След и используй навык перенаправления.', en: 'Swap to Chaos, trigger Stain, and use Redirect Skill.' },
        outcome: { ru: 'След усиливает урон Лакшаны, а на цели появляется метка Хаос.', en: 'Stain increases Lakshana damage and Chaos applies her target mark.' },
      },
      {
        id: 'chaos-ultimate', actor: 'Chaos', phase: 'burst', action: 'ultimate',
        instruction: { ru: 'Используй сверхспособность Хаос сразу после подготовки Следа и метки.', en: 'Use Chaos Ultimate immediately after preparing Stain and the target mark.' },
        outcome: { ru: 'Начинается основная последовательность урона Хаос.', en: 'Chaos main damage sequence begins.' },
      },
      {
        id: 'chaos-heavy-one', actor: 'Chaos', phase: 'burst', action: 'basic',
        instruction: { ru: 'Выполни первую усиленную тяжёлую атаку.', en: 'Perform the first enhanced Heavy Attack.' },
        outcome: { ru: 'Первая усиленная атака расходует подготовленный ресурс.', en: 'The first enhanced attack spends the prepared resource.' },
      },
      {
        id: 'chaos-heavy-two', actor: 'Chaos', phase: 'burst', action: 'basic',
        instruction: { ru: 'Выполни вторую усиленную тяжёлую атаку.', en: 'Perform the second enhanced Heavy Attack.' },
        outcome: { ru: 'Основная часть активной последовательности Хаос завершена.', en: 'The main active portion of Chaos sequence is complete.' },
      },
      {
        id: 'chaos-return-hathor', actor: 'Hathor', phase: 'recovery', action: 'swap',
        instruction: { ru: 'Вернись на Хатор и используй сверхспособность с доступными усиленными навыками.', en: 'Return to Hathor and use Ultimate with the available enhanced Skills.' },
        outcome: { ru: 'Хатор завершает последовательность и начинает подготовку следующей Реморы.', en: 'Hathor closes the sequence and begins preparing the next Remora.' },
      },
      {
        id: 'chaos-restart', actor: 'Hathor', phase: 'recovery', action: 'recovery', optional: true,
        instruction: { ru: 'После восстановления ключевых навыков повтори план с навыка перенаправления Хатор.', en: 'After key cooldowns recover, restart from Hathor Redirect Skill.' },
        outcome: { ru: 'Команда возвращается к началу подтверждённого порядка.', en: 'The team returns to the start of the sourced order.' },
      },
    ],
    sourcePublisher: publisher,
    sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/characters/chaos',
    sourceUpdatedAt: '2026-07-08',
    verifiedAt,
    timingPolicy,
  },
  {
    id: 'nanally-hexed-dual',
    title: { ru: 'Наналли · двойной урон и Проклятие', en: 'Nanally · Dual DPS Hexed' },
    description: {
      ru: 'Цзююань и Зеро запускают Цветение, Сакири подготавливает Проклятие, а Наналли завершает первую атакующую последовательность усиленными базовыми атаками.',
      en: 'Jiuyuan and Zero trigger Blossom, Sakiri prepares Hexed, and Nanally completes the first damage sequence with enhanced Basic Attacks.',
    },
    team: ['Nanally', 'Jiuyuan', 'Zero', 'Sakiri'],
    cyclePlan: ['blossom', 'hexed'],
    assumptions: [
      skillNamePolicy,
      {
        ru: 'Источник советует сохранить второе Проклятие для следующей полной ротации, а Цветение между ними можно запускать свободно.',
        en: 'The source recommends saving the second Hexed trigger for the next full rotation while Blossom may be used freely between them.',
      },
      {
        ru: 'Для полного расходования зарядов Наналли используется цепочка из пяти базовых и трёх заряженных атак.',
        en: 'A five-hit Basic string followed by a three-hit Charged string is used to spend Nanally charges completely.',
      },
    ],
    steps: [
      {
        id: 'nanally-jiuyuan-open', actor: 'Jiuyuan', phase: 'setup', action: 'prepare',
        instruction: { ru: 'Начни на Цзююань и подготовь переключение на Зеро.', en: 'Start on Jiuyuan and prepare the swap to Zero.' },
        outcome: { ru: 'Компонент Анимы готов к Цветению.', en: 'The Anima component is ready for Blossom.' },
      },
      {
        id: 'nanally-zero-blossom', actor: 'Zero', phase: 'setup', action: 'swap', cycle: 'blossom',
        instruction: { ru: 'Переключись на Зеро, запусти Цветение, затем используй навык перенаправления и сверхспособность.', en: 'Swap to Zero, trigger Blossom, then use Redirect Skill and Ultimate.' },
        outcome: { ru: 'Цветение активно, а шкала цикла готовится к Проклятию.', en: 'Blossom is active and the Cycle gauge is prepared for Hexed.' },
      },
      {
        id: 'nanally-sakiri-setup', actor: 'Sakiri', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Переключись на Сакири, используй сверхспособность и навык перенаправления.', en: 'Swap to Sakiri and use Ultimate followed by Redirect Skill.' },
        outcome: { ru: 'Усиления Сакири активны, компонент Чар готов к Проклятию.', en: 'Sakiri buffs are active and the Incantation component is ready for Hexed.' },
      },
      {
        id: 'nanally-jiuyuan-hexed', actor: 'Jiuyuan', phase: 'setup', action: 'swap', cycle: 'hexed',
        instruction: { ru: 'Переключись на Цзююань, запусти Проклятие, затем используй сверхспособность и навык перенаправления.', en: 'Swap to Jiuyuan, trigger Hexed, then use Ultimate and Redirect Skill.' },
        outcome: { ru: 'Проклятие начинает учитывать урон Анимы и Чар.', en: 'Hexed begins recording Anima and Incantation damage.' },
      },
      {
        id: 'nanally-redirect', actor: 'Nanally', phase: 'burst', action: 'redirect',
        instruction: { ru: 'Переключись на Наналли и используй навык перенаправления.', en: 'Swap to Nanally and use Redirect Skill.' },
        outcome: { ru: 'Наналли получает ресурс для усиленной последовательности.', en: 'Nanally gains the resources for her enhanced sequence.' },
      },
      {
        id: 'nanally-ultimate', actor: 'Nanally', phase: 'burst', action: 'ultimate',
        instruction: { ru: 'Используй сверхспособность Наналли.', en: 'Use Nanally Ultimate.' },
        outcome: { ru: 'Усиленные базовые атаки готовы к выполнению.', en: 'Enhanced Basic Attacks are ready.' },
      },
      {
        id: 'nanally-basic-string', actor: 'Nanally', phase: 'burst', action: 'basic',
        instruction: { ru: 'Выполни полную цепочку из пяти базовых атак.', en: 'Complete the full five-hit Basic Attack string.' },
        outcome: { ru: 'Основная часть зарядов Наналли расходуется внутри Проклятия.', en: 'Most Nanally charges are spent during Hexed.' },
      },
      {
        id: 'nanally-charged-string', actor: 'Nanally', phase: 'burst', action: 'basic',
        instruction: { ru: 'Заверши последовательность тремя заряженными атаками.', en: 'Finish with the three-hit Charged Attack string.' },
        outcome: { ru: 'Заряды Наналли полностью израсходованы, первая атакующая последовательность завершена.', en: 'Nanally charges are fully spent and the first damage sequence is complete.' },
      },
      {
        id: 'nanally-energy-recovery', actor: 'Sakiri', phase: 'recovery', action: 'recovery', optional: true,
        instruction: { ru: 'Между полными ротациями запускай Цветение по готовности и восстанавливай энергию Наналли и Сакири; Проклятие сохрани для следующего полного захода.', en: 'Between full rotations, trigger Blossom when available and rebuild Nanally and Sakiri Energy; save Hexed for the next full sequence.' },
        outcome: { ru: 'Энергия и Проклятие подготовлены к повтору с Цзююань.', en: 'Energy and Hexed are prepared for the next loop from Jiuyuan.' },
      },
    ],
    sourcePublisher: publisher,
    sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/characters/nanally',
    sourceUpdatedAt: '2026-06-23',
    verifiedAt,
    timingPolicy,
  },
  {
    id: 'lacrimosa-discord-dot',
    title: { ru: 'Лакримоза · периодический урон и Дискорд', en: 'Lacrimosa · DoT Discord' },
    description: {
      ru: 'Ханиэль и Сакири подготавливают усиления, Даффодил и Лакримоза чередуют быстрые переключения, а Нова и Поджог создают Дискорд.',
      en: 'Haniel and Sakiri prepare buffs, Daffodill and Lacrimosa alternate quick swaps, and Nova plus Scorch create Discord.',
    },
    team: ['Lacrimosa', 'Haniel', 'Sakiri', 'Daffodill'],
    cyclePlan: ['nova', 'scorch', 'discord'],
    assumptions: [
      skillNamePolicy,
      {
        ru: 'Переключение во время анимации сохраняет выполняющееся действие предыдущего персонажа; план отмечает такие места прямо в инструкции.',
        en: 'Swapping during an animation lets the previous action continue; the plan identifies those swap-cancel points explicitly.',
      },
      {
        ru: 'Если Ханиэль или Сакири не восстановили энергию, источник предлагает повторить короткую связку Лакримоза ↔ Даффодил.',
        en: 'If Haniel or Sakiri has not recovered enough Energy, the source recommends repeating the short Lacrimosa ↔ Daffodill loop.',
      },
    ],
    steps: [
      {
        id: 'lacrimosa-haniel-open', actor: 'Haniel', phase: 'setup', action: 'redirect',
        instruction: { ru: 'Начни на Ханиэль: используй навык перенаправления, затем сверхспособность.', en: 'Start on Haniel: use Redirect Skill, then Ultimate.' },
        outcome: { ru: 'Командные усиления Ханиэль активны.', en: 'Haniel team buffs are active.' },
      },
      {
        id: 'lacrimosa-sakiri-buffs', actor: 'Sakiri', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Переключись на Сакири, используй сверхспособность и навык перенаправления.', en: 'Swap to Sakiri, use Ultimate and Redirect Skill.' },
        outcome: { ru: 'Усиления Сакири и компонент Чар готовы.', en: 'Sakiri buffs and the Incantation component are ready.' },
      },
      {
        id: 'lacrimosa-daffodill-open', actor: 'Daffodill', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Переключись на Даффодил, используй сверхспособность и навык перенаправления; во время анимации переключись дальше.', en: 'Swap to Daffodill, use Ultimate and Redirect Skill, then swap during the animation.' },
        outcome: { ru: 'Даффодил продолжает действие вне поля и готовит быстрое возвращение.', en: 'Daffodill continues the action off-field and prepares the quick return.' },
      },
      {
        id: 'lacrimosa-transform', actor: 'Lacrimosa', phase: 'setup', action: 'redirect', cycle: 'nova',
        instruction: { ru: 'Переключись на Лакримозу, используй преобразующий навык перенаправления и во время анимации перейди на Сакири.', en: 'Swap to Lacrimosa, use the transformation Redirect Skill, and swap to Sakiri during the animation.' },
        outcome: { ru: 'Компонент Хаоса и Нова подготовлены к совмещению с Поджогом.', en: 'The Chaos component and Nova are prepared to combine with Scorch.' },
      },
      {
        id: 'lacrimosa-scorch', actor: 'Sakiri', phase: 'setup', action: 'swap', cycle: 'scorch',
        instruction: { ru: 'Выходом Сакири запусти Поджог и сразу вернись на Лакримозу.', en: 'Trigger Scorch by swapping to Sakiri, then return immediately to Lacrimosa.' },
        outcome: { ru: 'Нова и Поджог действуют одновременно и запускают Дискорд.', en: 'Nova and Scorch overlap and trigger Discord.' },
      },
      {
        id: 'lacrimosa-discord', actor: 'Lacrimosa', phase: 'burst', action: 'cycle', cycle: 'discord',
        instruction: { ru: 'Продолжай атаку Лакримозой внутри активного Дискорда.', en: 'Continue attacking with Lacrimosa while Discord is active.' },
        outcome: { ru: 'Дискорд снижает шкалу разрушения цели, а периодический урон продолжает действовать.', en: 'Discord reduces the target Break gauge while damage over time continues.' },
      },
      {
        id: 'lacrimosa-basic-five', actor: 'Lacrimosa', phase: 'burst', action: 'basic',
        instruction: { ru: 'Выполни базовые атаки с первой по пятую; во время пятой переключись на Даффодил.', en: 'Perform Basic Attacks one through five, swapping to Daffodill during the fifth.' },
        outcome: { ru: 'Пятая атака Лакримозы продолжается во время переключения.', en: 'Lacrimosa fifth attack continues during the swap.' },
      },
      {
        id: 'lacrimosa-phantom-one', actor: 'Daffodill', phase: 'burst', action: 'basic',
        instruction: { ru: 'Используй первую усиленную базовую атаку Даффодил и во время анимации вернись на Лакримозу.', en: 'Use Daffodill first enhanced Basic Attack and swap back to Lacrimosa during the animation.' },
        outcome: { ru: 'Урон Даффодил продолжается вне поля, Лакримоза возвращается к своей цепочке.', en: 'Daffodill damage continues off-field while Lacrimosa resumes her string.' },
      },
      {
        id: 'lacrimosa-redirect-five', actor: 'Lacrimosa', phase: 'burst', action: 'redirect',
        instruction: { ru: 'Используй навык перенаправления Лакримозы, чтобы быстро перейти к пятой базовой атаке; во время неё снова переключись на Даффодил.', en: 'Use Lacrimosa Redirect Skill to advance to the fifth Basic Attack, then swap to Daffodill during it.' },
        outcome: { ru: 'Вторая усиленная атака Даффодил готова.', en: 'Daffodill second enhanced attack is ready.' },
      },
      {
        id: 'lacrimosa-phantom-two', actor: 'Daffodill', phase: 'burst', action: 'basic',
        instruction: { ru: 'Используй вторую усиленную базовую атаку Даффодил, затем переключись на Ханиэль.', en: 'Use Daffodill second enhanced Basic Attack, then swap to Haniel.' },
        outcome: { ru: 'Короткая связка завершена; команда готова перезапустить усиления.', en: 'The short loop is complete and the team can restart its buffs.' },
      },
      {
        id: 'lacrimosa-repeat-loop', actor: 'Lacrimosa', phase: 'recovery', action: 'recovery', optional: true,
        instruction: { ru: 'Если Ханиэль или Сакири ещё не накопили энергию, повтори короткую связку Лакримоза ↔ Даффодил.', en: 'If Haniel or Sakiri still lacks Energy, repeat the short Lacrimosa ↔ Daffodill loop.' },
        outcome: { ru: 'Энергия поддержки восстановлена без выдуманного фиксированного числа повторов.', en: 'Support Energy is rebuilt without inventing a fixed repeat count.' },
      },
    ],
    sourcePublisher: publisher,
    sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/characters/lacrimosa',
    sourceUpdatedAt: '2026-06-23',
    verifiedAt,
    timingPolicy,
  },
  {
    id: 'baicang-firefly-hyper',
    title: { ru: 'Байканг · команда светлячка', en: 'Baicang · Firefly Hyper' },
    description: {
      ru: 'Адлер и Сакири подготавливают защиту и усиления, Даффодил открывает связку, а Байканг чередует сверхспособность, базовые атаки и заряженные атаки после уклонения.',
      en: 'Adler and Sakiri prepare protection and buffs, Daffodill opens the sequence, and Baicang alternates Ultimate, Basic Attacks and Dodge Charged Attacks.',
    },
    team: ['Baicang', 'Adler', 'Sakiri', 'Daffodill'],
    cyclePlan: ['scorch'],
    assumptions: [
      skillNamePolicy,
      {
        ru: 'На полном резонансе Адлер даёт командное усиление Чар; без него порядок действий сохраняется, но сила усиления отличается.',
        en: 'At full Resonance Adler provides a team Incantation buff; without it the order remains valid but the buff strength differs.',
      },
      {
        ru: 'Байканг возвращается до окончания усиленных атак Даффодил, чтобы продолжить собственную последовательность без паузы.',
        en: 'Baicang returns before Daffodill enhanced attacks end to continue the sequence without a pause.',
      },
    ],
    steps: [
      {
        id: 'baicang-adler-open', actor: 'Adler', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Начни на Адлер: используй сверхспособность и навык перенаправления.', en: 'Start on Adler: use Ultimate and Redirect Skill.' },
        outcome: { ru: 'Команда получает защиту; при полном резонансе также действует усиление Чар.', en: 'The team gains protection and, at full Resonance, an Incantation buff.' },
      },
      {
        id: 'baicang-sakiri-buff', actor: 'Sakiri', phase: 'setup', action: 'ultimate',
        instruction: { ru: 'Переключись на Сакири, используй сверхспособность и навык перенаправления.', en: 'Swap to Sakiri, use Ultimate and Redirect Skill.' },
        outcome: { ru: 'Усиление АТК и компонент Чар готовы к основной последовательности.', en: 'ATK buffs and the Incantation component are ready.' },
      },
      {
        id: 'baicang-daffodill-open', actor: 'Daffodill', phase: 'setup', action: 'ultimate', cycle: 'scorch',
        instruction: { ru: 'Переключись на Даффодил, используй сверхспособность и навык перенаправления.', en: 'Swap to Daffodill, use Ultimate and Redirect Skill.' },
        outcome: { ru: 'Поджог и быстрое переключение на Байканг подготовлены.', en: 'Scorch and the quick swap to Baicang are prepared.' },
      },
      {
        id: 'baicang-swap-ultimate', actor: 'Baicang', phase: 'burst', action: 'swap',
        instruction: { ru: 'Во время анимации Даффодил переключись на Байканг и сразу используй сверхспособность.', en: 'Swap to Baicang during Daffodill animation and use Ultimate immediately.' },
        outcome: { ru: 'Байканг входит в основную усиленную последовательность.', en: 'Baicang enters the main enhanced sequence.' },
      },
      {
        id: 'baicang-basic-three', actor: 'Baicang', phase: 'burst', action: 'basic',
        instruction: { ru: 'Выполни первые три базовые атаки, затем используй навык перенаправления.', en: 'Perform the first three Basic Attacks, then use Redirect Skill.' },
        outcome: { ru: 'Ресурс Байканг подготовлен к заряженным атакам после уклонения.', en: 'Baicang resources are prepared for Dodge Charged Attacks.' },
      },
      {
        id: 'baicang-phantom-one', actor: 'Daffodill', phase: 'burst', action: 'basic',
        instruction: { ru: 'Переключись на Даффодил для первой усиленной базовой атаки и вернись на Байканг во время её анимации.', en: 'Swap to Daffodill for the first enhanced Basic Attack and return to Baicang during its animation.' },
        outcome: { ru: 'Урон Даффодил продолжается, Байканг не теряет свою активную последовательность.', en: 'Daffodill damage continues while Baicang keeps the active sequence.' },
      },
      {
        id: 'baicang-dodge-charged-one', actor: 'Baicang', phase: 'burst', action: 'skill',
        instruction: { ru: 'Выполни заряженную атаку после уклонения.', en: 'Perform a Dodge Charged Attack.' },
        outcome: { ru: 'Байканг наносит усиленный урон внутри сверхспособности.', en: 'Baicang deals enhanced damage during Ultimate.' },
      },
      {
        id: 'baicang-phantom-two', actor: 'Daffodill', phase: 'burst', action: 'basic',
        instruction: { ru: 'Переключись на Даффодил для второй усиленной базовой атаки и вернись на Байканг до её окончания.', en: 'Swap to Daffodill for the second enhanced Basic Attack and return to Baicang before it ends.' },
        outcome: { ru: 'Вторая атака Даффодил продолжается вне поля.', en: 'Daffodill second attack continues off-field.' },
      },
      {
        id: 'baicang-dodge-spam', actor: 'Baicang', phase: 'burst', action: 'basic',
        instruction: { ru: 'До конца сверхспособности повторяй заряженные атаки после уклонения, добавляя критические контрудары и навык перенаправления по готовности.', en: 'For the rest of Ultimate, repeat Dodge Charged Attacks and add Critical Counters and Redirect Skill when available.' },
        outcome: { ru: 'Оставшаяся длительность сверхспособности используется без придуманного фиксированного числа атак.', en: 'The remaining Ultimate duration is used without inventing a fixed attack count.' },
      },
      {
        id: 'baicang-restart', actor: 'Adler', phase: 'recovery', action: 'recovery', optional: true,
        instruction: { ru: 'Если энергия команды восстановлена, повтори порядок с Адлер.', en: 'If team Energy is restored, restart the order from Adler.' },
        outcome: { ru: 'Команда возвращается к защитной и усиливающей подготовке.', en: 'The team returns to protection and buff setup.' },
      },
    ],
    sourcePublisher: publisher,
    sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/characters/baicang',
    sourceUpdatedAt: '2026-06-23',
    verifiedAt,
    timingPolicy,
  },
];
