import { describe, expect, it } from 'vitest';
import {
  applyBuildProfile,
  BUILD_PROFILE_LIBRARY_VERSION,
  canonicalProfileJson,
  createBuildProfile,
  deleteBuildProfile,
  exportBuildProfile,
  importBuildProfile,
  initialBuildProfileLibrary,
  normalizeBuildProfileLibrary,
  profileChecksum,
  renameBuildProfile,
  sanitizeBuildProfileSnapshot,
  updateBuildProfile,
} from './build-profiles';
import {
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  type GameVisibleCharacterBuild,
} from './game-visible-build';

function configuredBuild(characterName = 'Hathor'): GameVisibleCharacterBuild {
  const build = createEmptyGameVisibleBuild(characterName);
  return {
    ...build,
    level: 80,
    maxLevel: 80,
    awakeningLevel: 4,
    baseAtk: 700,
    activeTeamEffectIds: ['temporary.effect'],
    stats: {
      ...build.stats,
      atk: 2_345,
      critRate: 72.5,
      critDamage: 180,
      damageBonus: 22,
      attributeDamageBonus: 18,
    },
    arc: {
      ...build.arc,
      arcName: 'Blushing Mirage',
      level: 80,
      mixingRank: 3,
      afterUltimateActive: true,
    },
    skills: { basic: 8, skill: 10, ultimate: 10, support: 7 },
    console: { gridType: 3, typeThreeModules: 5 },
    testMode: 'verified-action',
    verifiedActionId: 'hathor.rider-express.level-10',
  };
}

const options = { id: 'my-hathor', now: '2026-08-05T00:00:00.000Z' };

describe('reusable game-visible build profiles', () => {
  it('sanitizes through current limits and strips every temporary condition', () => {
    const unsafe = configuredBuild();
    unsafe.stats.critRate = 999;
    unsafe.skills.skill = 999;
    const snapshot = sanitizeBuildProfileSnapshot(unsafe);
    expect(snapshot?.stats.critRate).toBe(100);
    expect(snapshot?.skills.skill).toBe(15);
    expect(snapshot?.activeTeamEffectIds).toEqual([]);
    expect(snapshot?.arc.afterUltimateActive).toBe(false);
    expect(snapshot?.testMode).toBe('neutral-reference');
    expect(snapshot?.verifiedActionId).toBe('');
    expect(sanitizeBuildProfileSnapshot({ characterName: 'Unknown Esper' })).toBeNull();
  });

  it('creates, renames, updates and deletes collision-safe profiles', () => {
    let library = createBuildProfile(initialBuildProfileLibrary(), configuredBuild(), 'Hathor main', options);
    library = createBuildProfile(library, configuredBuild(), 'Hathor alt', options);
    expect(library.profiles.map((profile) => profile.id)).toEqual(['my-hathor', 'my-hathor-2']);
    library = renameBuildProfile(library, 'my-hathor', '<Hathor burst>', '2026-08-05T01:00:00Z');
    expect(library.profiles[0]?.name).toBe('Hathor burst');
    const updated = configuredBuild();
    updated.stats.atk = 2_500;
    library = updateBuildProfile(library, 'my-hathor', updated, 'Hathor 2500', '2026-08-05T02:00:00Z');
    expect(library.profiles[0]?.build.stats.atk).toBe(2_500);
    expect(library.profiles[0]?.activeTeamEffectIds).toBeUndefined();
    library = deleteBuildProfile(library, 'my-hathor-2');
    expect(library.profiles).toHaveLength(1);
  });

  it('applies a same-character profile without restoring temporary windows', () => {
    const library = createBuildProfile(initialBuildProfileLibrary(), configuredBuild('Hathor'), 'Saved Hathor', options);
    const team = initialGameVisibleTeamState();
    team.activeSlot = 1;
    team.builds[1] = {
      ...createEmptyGameVisibleBuild('Hathor'),
      testMode: 'verified-action',
      verifiedActionId: 'hathor.rider-express.level-10',
      activeTeamEffectIds: ['hathor.delay-warning.remora-crit-rate'],
    };
    const result = applyBuildProfile(team, 1, library.profiles[0]!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.team.builds[1]?.stats.atk).toBe(2_345);
    expect(result.team.builds[1]?.testMode).toBe('verified-action');
    expect(result.team.builds[1]?.verifiedActionId).toBe('hathor.rider-express.level-10');
    expect(result.team.builds[1]?.activeTeamEffectIds).toEqual([]);
    expect(result.team.builds[1]?.arc.afterUltimateActive).toBe(false);
  });

  it('blocks duplicate characters and resets test context when replacing a slot', () => {
    const hathor = createBuildProfile(initialBuildProfileLibrary(), configuredBuild('Hathor'), 'Hathor', options).profiles[0]!;
    const team = initialGameVisibleTeamState();
    expect(applyBuildProfile(team, 0, hathor)).toEqual({ ok: false, error: 'duplicate-character' });

    const baicangProfile = createBuildProfile(
      initialBuildProfileLibrary(),
      configuredBuild('Baicang'),
      'Baicang',
      { ...options, id: 'baicang' },
    ).profiles[0]!;
    const applied = applyBuildProfile(team, 0, baicangProfile);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.team.builds[0]?.characterName).toBe('Baicang');
    expect(applied.team.builds[0]?.testMode).toBe('neutral-reference');
    expect(applied.team.builds[0]?.verifiedActionId).toBe('');
    expect(applied.team.activeSlot).toBe(0);
  });

  it('exports canonical checksummed JSON and rejects corruption', () => {
    const profile = createBuildProfile(initialBuildProfileLibrary(), configuredBuild(), 'Hathor', options).profiles[0]!;
    const exported = exportBuildProfile(profile);
    const parsed = JSON.parse(exported) as { payload: unknown; checksum: string };
    expect(parsed.checksum).toBe(profileChecksum(parsed.payload));
    expect(canonicalProfileJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(profileChecksum({ a: 1, b: 2 })).toBe(profileChecksum({ b: 2, a: 1 }));

    const corrupted = exported.replace('2345', '2346');
    expect(importBuildProfile(initialBuildProfileLibrary(), corrupted, options)).toEqual({
      ok: false,
      error: 'checksum-mismatch',
    });
  });

  it('imports a valid profile with a local collision-safe ID', () => {
    const source = createBuildProfile(initialBuildProfileLibrary(), configuredBuild(), 'Hathor', options).profiles[0]!;
    const exported = exportBuildProfile(source);
    let local = createBuildProfile(initialBuildProfileLibrary(), configuredBuild(), 'Existing', options);
    const imported = importBuildProfile(local, exported, options);
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    local = imported.library;
    expect(local.profiles.map((profile) => profile.id)).toEqual(['my-hathor', 'my-hathor-2']);
    expect(imported.profile.build.activeTeamEffectIds).toEqual([]);
    expect(imported.profile.build.arc.afterUltimateActive).toBe(false);
  });

  it('recovers a v1 library deterministically and removes malformed records', () => {
    const raw = {
      version: BUILD_PROFILE_LIBRARY_VERSION,
      profiles: [
        { id: 'same', name: 'One', build: configuredBuild(), createdAt: 'bad', updatedAt: 'bad' },
        { id: 'same', name: 'Two', build: configuredBuild(), createdAt: '2026-08-05', updatedAt: '2026-08-05' },
        { id: 'broken', name: '', build: { characterName: 'Unknown' } },
      ],
    };
    const normalized = normalizeBuildProfileLibrary(raw);
    expect(normalized?.profiles.map((profile) => profile.id)).toEqual(['same', 'same-2']);
    expect(normalized?.profiles[0]?.createdAt).toBe('1970-01-01T00:00:00.000Z');
    expect(normalizeBuildProfileLibrary({ version: 2, profiles: [] })).toBeNull();
  });
});
