const replacements: readonly [RegExp, string][] = [
  [/MAX HP/gu, 'макс. ОЗ'],
  [/\bATK\b/gu, 'АТК'],
  [/\bDEF\b/gu, 'ЗАЩ'],
  [/\bHP\b/gu, 'ОЗ'],
  [/крит\. урон/giu, 'критический урон'],
  [/крит\. шанс/giu, 'шанс критического удара'],
  [/интенсивность сломления/giu, 'эффективность разрушения'],
  [/интенсивности сломления/giu, 'эффективности разрушения'],
  [/интенсивностью сломления/giu, 'эффективностью разрушения'],
  [/интенсивность разрушения/giu, 'эффективность разрушения'],
  [/интенсивности разрушения/giu, 'эффективности разрушения'],
  [/интенсивностью разрушения/giu, 'эффективностью разрушения'],
  [/шкала сломления/giu, 'шкала разрушения'],
  [/шкалы сломления/giu, 'шкалы разрушения'],
  [/шкале сломления/giu, 'шкале разрушения'],
  [/шкалу сломления/giu, 'шкалу разрушения'],
  [/шкалой сломления/giu, 'шкалой разрушения'],
  [/эффективность заряда/giu, 'эффективность зарядки'],
  [/эффективности заряда/giu, 'эффективности зарядки'],
  [/эффективностью заряда/giu, 'эффективностью зарядки'],
  [/идеального уклонения/giu, 'критического уклонения'],
  [/идеальное уклонение/giu, 'критическое уклонение'],
  [/идеального контрудара/giu, 'критического контрудара'],
  [/идеальный контрудар/giu, 'критический контрудар'],
  [/урон при сломлении/giu, 'урон разрушения'],
];

/**
 * Older imported guide text is preserved as source input, then normalized into
 * the current public Russian vocabulary before it reaches UI and API consumers.
 * Numeric values, conditions and English source text are never changed here.
 */
export function normalizeRussianGameText(value: string): string {
  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}
