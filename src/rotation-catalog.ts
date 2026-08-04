import { additionalRotationPresets } from './rotation-presets-extra';
import { rotationPresets as originalRotationPresets } from './rotation-presets';

export const rotationPresets = [...originalRotationPresets, ...additionalRotationPresets];
export const rotationPresetById = new Map(rotationPresets.map((preset) => [preset.id, preset]));
