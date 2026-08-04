import { additionalRotationPresets } from './rotation-presets-extra';
import { rotationPresets as baseRotationPresets } from './rotation-presets-base';

export const rotationPresets = [...baseRotationPresets, ...additionalRotationPresets];
export const rotationPresetById = new Map(rotationPresets.map((preset) => [preset.id, preset]));
