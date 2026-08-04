const replacements: readonly [RegExp, string][] = [
  [/MAX HP/gu, 'макс. ОЗ'],
  [/\bATK\b/gu, 'АТК'],
  [/\bDEF\b/gu, 'ЗАЩ'],
  [/\bHP\b/gu, 'ОЗ'],
  [/крит\. урон/giu, 'критический урон'],
  [/крит\. шанс/giu, 'шанс критического удара'],
  [/интенсивност(?:ь|и|ью) сломления/giu, (match) => match.toLocaleLowerCase('ru').endsWith('и') ? 'эффективности разрушения' : match.toLocaleLowerCase('ru').endsWith('ью') ? 'эффективностью разрушения' : 'эффективность разрушения'],
  [/интенсивност(?:ь|и|ью) разрушения/giu, (match) => match.toLocaleLowerCase('ru').endsWith('и') ? 'эффективности разрушения' : match.toLocaleLowerCase('ru').endsWith('ью') ? 'эффективностью разрушения' : 'эффективность разрушения'],
  [/шкал(?:а|ы|е|у|ой) сломления/giu, (match) => {
    const lower = match.toLocaleLowerCase('ru');
    if (lower.startsWith('шкалы')) return 'шкалы разрушения';
    if (lower.startsWith('шкале')) return 'шкале разрушения';
    if (lower.startsWith('шкалу')) return 'шкалу разрушения';
    if (lower.startsWith('шкалой')) return 'шкалой разрушения';
    return 'шкала разрушения';
  }],
  [/эффективност(?:ь|и|ью) заряда/giu, (match) => match.toLocaleLowerCase('ru').endsWith('и') ? 'эффективности зарядки' : match.toLocaleLowerCase('ru').endsWith('ью') ? 'эффективностью зарядки' : 'эффективность зарядки'],
  [/идеальн(?:ого|ый|ом) уклонени(?:я|е|и)/giu, 'критического уклонения'],
  [/идеальн(?:ого|ый|ом) контрудар(?:а|е|ом)?/giu, 'критического контрудара'],
  [/урон при сломлении/giu, 'урон разрушения'],
];

/**
 * Older imported guide text is preserved as source input, then normalized into
 * the current public Russian vocabulary before it reaches UI and API consumers.
 * Numeric values, conditions and English source text are never changed here.
 */
export function normalizeRussianGameText(value: string): string {
  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement as string), value);
}
