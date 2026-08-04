import { characterTermById, type CharacterTermRecord } from './character-terms';
import type { RotationPreset, RotationStep } from './types';

export const rotationStepTermRefs: Readonly<Record<string, readonly string[]>> = {
  'shinku-charge:hathor-open': [
    'hathor.ultimate.rider-express',
    'hathor.redirect.aerial-command',
  ],
  'shinku-charge:zero-fill': [
    'zero.ultimate.divide-by-zero',
    'zero.redirect.appraise-and-engrave',
  ],
  'shinku-charge:nanally-charge': [
    'nanally.ultimate.colucci-ultimate-technique',
    'nanally.redirect.colucci-howling-technique',
  ],
  'hathor-hyper:jiuyuan-open': [
    'jiuyuan.ultimate.final-reckoning',
    'jiuyuan.redirect.intel-hunter',
  ],
  'hathor-hyper:zero-blossom': ['zero.ultimate.divide-by-zero'],
  'hathor-hyper:haniel-buffs': [
    'haniel.redirect.silent-moonlit-forest-guardian',
    'haniel.ultimate.melody-named-haniel',
  ],
  'hathor-hyper:hathor-stain': [
    'hathor.redirect.aerial-command',
    'hathor.resource.express-delivery-power',
    'hathor.sub-action.cyclone-strike',
  ],
  'hathor-hyper:hathor-ultimate': [
    'hathor.ultimate.rider-express',
    'hathor.state.emergency-delivery',
    'hathor.sub-action.cyclone-strike',
  ],
  'hathor-hyper:zero-third-strike': ['zero.redirect.appraise-and-engrave'],

  'chaos-remora-bomb:chaos-hathor-redirect': ['hathor.redirect.aerial-command'],
  'chaos-remora-bomb:chaos-zero-remora': ['zero.ultimate.divide-by-zero'],
  'chaos-remora-bomb:chaos-haniel-buffs': [
    'haniel.redirect.silent-moonlit-forest-guardian',
    'haniel.ultimate.melody-named-haniel',
  ],
  'chaos-remora-bomb:chaos-return-hathor': [
    'hathor.ultimate.rider-express',
    'hathor.sub-action.cyclone-strike',
  ],

  'nanally-hexed-dual:nanally-zero-blossom': [
    'zero.redirect.appraise-and-engrave',
    'zero.ultimate.divide-by-zero',
  ],
  'nanally-hexed-dual:nanally-sakiri-setup': [
    'sakiri.ultimate.feast-of-gluttony',
    'sakiri.redirect.swallow-whole',
  ],
  'nanally-hexed-dual:nanally-jiuyuan-hexed': [
    'jiuyuan.ultimate.final-reckoning',
    'jiuyuan.redirect.intel-hunter',
    'jiuyuan.mark.rose-pact',
  ],
  'nanally-hexed-dual:nanally-redirect': ['nanally.redirect.colucci-howling-technique'],
  'nanally-hexed-dual:nanally-ultimate': [
    'nanally.ultimate.colucci-ultimate-technique',
    'nanally.state.ichi-daime-authority',
  ],
  'nanally-hexed-dual:nanally-basic-string': ['nanally.basic.colucci-secret-skill'],
  'nanally-hexed-dual:nanally-charged-string': ['nanally.charged.colucci-secret-skill'],

  'lacrimosa-discord-dot:lacrimosa-haniel-open': [
    'haniel.redirect.silent-moonlit-forest-guardian',
    'haniel.ultimate.melody-named-haniel',
  ],
  'lacrimosa-discord-dot:lacrimosa-sakiri-buffs': [
    'sakiri.ultimate.feast-of-gluttony',
    'sakiri.redirect.swallow-whole',
  ],
  'lacrimosa-discord-dot:lacrimosa-daffodill-open': [
    'daffodill.ultimate.witness-this-finale',
    'daffodill.redirect.resonance',
  ],
  'lacrimosa-discord-dot:lacrimosa-transform': [
    'lacrimosa.redirect.morning-tomato',
    'lacrimosa.ultimate.devilish-gift',
  ],
  'lacrimosa-discord-dot:lacrimosa-discord': ['lacrimosa.effect.nightmare'],
  'lacrimosa-discord-dot:lacrimosa-basic-five': [
    'lacrimosa.basic.sweet-and-sour',
    'lacrimosa.sub-action.tomato-metal',
    'lacrimosa.sub-action.tomato-percussion',
  ],
  'lacrimosa-discord-dot:lacrimosa-redirect-five': ['lacrimosa.redirect.morning-tomato'],
  'lacrimosa-discord-dot:lacrimosa-phantom-one': ['daffodill.sub-action.phantom-step'],
  'lacrimosa-discord-dot:lacrimosa-phantom-two': ['daffodill.sub-action.phantom-step'],

  'baicang-firefly-hyper:baicang-adler-open': [
    'adler.ultimate.tranquility',
    'adler.redirect.evils-bane',
    'adler.effect.blessing',
  ],
  'baicang-firefly-hyper:baicang-sakiri-buff': [
    'sakiri.ultimate.feast-of-gluttony',
    'sakiri.redirect.swallow-whole',
  ],
  'baicang-firefly-hyper:baicang-daffodill-open': [
    'daffodill.ultimate.witness-this-finale',
    'daffodill.redirect.resonance',
  ],
  'baicang-firefly-hyper:baicang-phantom-one': ['daffodill.sub-action.phantom-step'],
  'baicang-firefly-hyper:baicang-phantom-two': ['daffodill.sub-action.phantom-step'],
};

// The current source uses the same named basic technique for Nanally's normal
// and charged strings. Expose a virtual alias only to make the step binding
// explicit while retaining one canonical game-data record.
const virtualAliases: Readonly<Record<string, string>> = {
  'nanally.charged.colucci-secret-skill': 'nanally.basic.colucci-secret-skill',
};

export function rotationStepTermKey(presetId: string, stepId: string): string {
  return `${presetId}:${stepId}`;
}

export function termIdsForRotationStep(presetId: string, stepId: string): readonly string[] {
  return rotationStepTermRefs[rotationStepTermKey(presetId, stepId)] ?? [];
}

export function termsForBoundRotationStep(presetId: string, step: RotationStep): CharacterTermRecord[] {
  return termIdsForRotationStep(presetId, step.id).flatMap((rawId) => {
    const id = virtualAliases[rawId] ?? rawId;
    const term = characterTermById.get(id);
    return term ? [term] : [];
  });
}

export function validateRotationStepTermBindings(presets: readonly RotationPreset[]): string[] {
  const errors: string[] = [];
  const knownKeys = new Set<string>();

  for (const preset of presets) {
    for (const step of preset.steps) {
      const key = rotationStepTermKey(preset.id, step.id);
      knownKeys.add(key);
      for (const rawId of rotationStepTermRefs[key] ?? []) {
        const id = virtualAliases[rawId] ?? rawId;
        const term = characterTermById.get(id);
        if (!term) {
          errors.push(`${key}:unknown-term:${rawId}`);
          continue;
        }
        if (term.characterName !== step.actor) errors.push(`${key}:actor-mismatch:${rawId}:${term.characterName}`);
        if (term.resolution === 'unresolved') errors.push(`${key}:unresolved-exact-term:${rawId}`);
      }
    }
  }

  for (const key of Object.keys(rotationStepTermRefs)) {
    if (!knownKeys.has(key)) errors.push(`${key}:unknown-step`);
  }
  return errors;
}
