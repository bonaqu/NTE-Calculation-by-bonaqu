import { describe, expect, it } from 'vitest';
import { calculateTeam } from '../packages/calculation-core/src';
import { defaultMembers } from './team-defaults';
import { availableEsperCycles, applyTeamIdentities, normalizeExplorerTeam, normalizePresetProgress, validateRotationPreset } from './rotation-engine';
import { rotationPresets } from './rotation-presets';

const initialPreset = rotationPresets[0]!;

describe('rotation engine', () => {
  it('derives pair and triple cycles for the Shinku Charge team', () => {
    const ids = availableEsperCycles(['Shinku', 'Hathor', 'Zero', 'Nanally']).map((cycle) => cycle.id);
    expect(ids).toContain('blossom');
    expect(ids).toContain('remora');
    expect(ids).toContain('charge');
    expect(ids).not.toContain('stain');
  });

  it('derives all declared cycles for the Hathor Hyper team', () => {
    const ids = availableEsperCycles(['Hathor', 'Jiuyuan', 'Zero', 'Haniel']).map((cycle) => cycle.id);
    expect(ids).toEqual(expect.arrayContaining(['blossom', 'remora', 'stain', 'charge']));
  });

  it('validates every shipped preset', () => {
    for (const preset of rotationPresets) {
      const result = validateRotationPreset(preset);
      expect(result.errors).toEqual([]);
      expect(result.valid).toBe(true);
    }
  });

  it('changes only identities when applying a preset team', () => {
    const duration = 35;
    const before = calculateTeam(defaultMembers, duration);
    const next = applyTeamIdentities(defaultMembers, initialPreset.team);
    const after = calculateTeam(next, duration);
    expect(next.map((member) => member.name)).toEqual(initialPreset.team);
    expect(next.map(({ id: _id, name: _name, ...stats }) => stats)).toEqual(defaultMembers.map(({ id: _id, name: _name, ...stats }) => stats));
    expect(after.totalDamage).toBeCloseTo(before.totalDamage, 8);
  });

  it('repairs damaged explorer and progress state', () => {
    const team = normalizeExplorerTeam(['Синку', 'Shinku', 'Хатор', 'missing'], initialPreset.team);
    expect(team).toHaveLength(4);
    expect(new Set(team).size).toBe(4);
    expect(team[0]).toBe('Shinku');
    expect(team).toContain('Hathor');

    const presetIds = new Set(rotationPresets.map((preset) => preset.id));
    const stepIds = new Map(rotationPresets.map((preset) => [preset.id, new Set(preset.steps.map((step) => step.id))]));
    const progress = normalizePresetProgress({
      'shinku-charge': ['shinku-prep', 'shinku-prep', 'missing'],
      unknown: ['x'],
    }, presetIds, stepIds);
    expect(progress).toEqual({ 'shinku-charge': ['shinku-prep'] });
  });
});
