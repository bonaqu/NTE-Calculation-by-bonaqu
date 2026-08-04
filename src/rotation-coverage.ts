import { characterCatalog } from './characters';
import { rotationPresets } from './rotation-catalog';

export interface RotationCoverageReport {
  presetCount: number;
  representedMainCharacters: readonly string[];
  missingReleasedCharacters: readonly string[];
  newestGuideDate: string;
  oldestGuideDate: string;
  verifiedAt: string;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function buildRotationCoverageReport(): RotationCoverageReport {
  const representedMainCharacters = sortedUnique(rotationPresets.map((preset) => preset.team[0]).filter(Boolean));
  const releasedCharacters = characterCatalog
    .filter((character) => character.releaseStatus === 'released')
    .map((character) => character.name);
  const guideDates = rotationPresets.map((preset) => preset.sourceUpdatedAt).sort();
  const verificationDates = rotationPresets.map((preset) => preset.verifiedAt).sort();

  return {
    presetCount: rotationPresets.length,
    representedMainCharacters,
    missingReleasedCharacters: sortedUnique(releasedCharacters.filter((name) => !representedMainCharacters.includes(name))),
    newestGuideDate: guideDates.at(-1) ?? '',
    oldestGuideDate: guideDates[0] ?? '',
    verifiedAt: verificationDates.at(-1) ?? '',
  };
}

export const rotationCoverage = buildRotationCoverageReport();
