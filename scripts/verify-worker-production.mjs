const base = String(process.env.DEPLOYMENT_URL || '').replace(/\/$/u, '');
if (!base) throw new Error('DEPLOYMENT_URL is required');

const expected = {
  serviceVersion: process.env.EXPECTED_SERVICE_VERSION || '0.9.0',
  formulaVersion: process.env.EXPECTED_FORMULA_VERSION || '0.2',
  visibleBuildVersion: Number(process.env.EXPECTED_VISIBLE_BUILD_VERSION || 1),
  verifiedActionCount: Number(process.env.EXPECTED_VERIFIED_ACTION_COUNT || 14),
  partialCharacters: String(process.env.EXPECTED_PARTIAL_CHARACTERS || 'Chaos,Hathor,Jiuyuan,Lacrimosa,Nanally,Shinku,Zero')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .sort(),
};

const endpoints = {
  health: `${base}/api/v1/health`,
  arcs: `${base}/api/v1/data/arcs`,
  presets: `${base}/api/v1/data/arc-presets`,
  characters: `${base}/api/v1/data/characters`,
  combatModels: `${base}/api/v1/data/combat-models`,
  cycles: `${base}/api/v1/data/esper-cycles`,
  rotations: `${base}/api/v1/data/rotation-presets`,
  progression: `${base}/api/v1/data/progression/characters`,
  visibleCalculation: `${base}/api/v1/calculate/visible-team`,
};

const emptyStats = (atk = 0) => ({
  hp: 0,
  atk,
  def: 0,
  critRate: 0,
  critDamage: 0,
  damageBonus: 0,
  attributeDamageBonus: 0,
  chargeSpeed: 100,
  cycleIntensity: 0,
  breakIntensity: 0,
});

const emptyArc = () => ({
  arcName: '',
  level: 1,
  maxLevel: 80,
  baseAtk: 0,
  secondaryLabel: '',
  secondaryValue: 0,
  mixingRank: 1,
  afterUltimateActive: false,
});

const build = (characterName, overrides = {}) => ({
  characterName,
  level: 1,
  maxLevel: 20,
  awakeningLevel: 0,
  baseAtk: 0,
  activeTeamEffectIds: [],
  stats: emptyStats(),
  arc: emptyArc(),
  skills: { basic: 1, skill: 1, ultimate: 1, support: 1 },
  console: { gridType: 0, typeThreeModules: 0 },
  testMode: 'neutral-reference',
  verifiedActionId: '',
  ...overrides,
});

const payload = (builds, targetLevel = 80) => ({
  version: 1,
  activeSlot: 0,
  duration: 30,
  builds,
  target: {
    level: targetLevel,
    resistance: 10,
    defenceReduction: 0,
    resistanceReduction: 0,
    boss: true,
  },
});

const teamPayload = (primary, targetLevel = 80) => payload([
  primary,
  build('Hathor'),
  build('Zero'),
  build('Nanally'),
], targetLevel);

const shinkuPayload = teamPayload(build('Shinku', {
  level: 70,
  maxLevel: 70,
  awakeningLevel: 5,
  stats: {
    hp: 21316,
    atk: 2026,
    def: 968,
    critRate: 79,
    critDamage: 176.4,
    damageBonus: 8,
    attributeDamageBonus: 10,
    chargeSpeed: 100,
    cycleIntensity: 0,
    breakIntensity: 48,
  },
  arc: {
    arcName: 'Blushing Mirage',
    level: 80,
    maxLevel: 80,
    baseAtk: 570,
    secondaryLabel: 'CRIT Rate',
    secondaryValue: 24,
    mixingRank: 1,
    afterUltimateActive: false,
  },
  skills: { basic: 9, skill: 9, ultimate: 9, support: 8 },
  console: { gridType: 2, typeThreeModules: 4 },
}));

const nanallyPayload = teamPayload(build('Nanally', {
  level: 80,
  maxLevel: 80,
  stats: emptyStats(2000),
  skills: { basic: 11, skill: 1, ultimate: 1, support: 1 },
  testMode: 'verified-action',
  verifiedActionId: 'nanally.fair-duel.level-11',
}));

const zeroPayload = teamPayload(build('Zero', {
  level: 70,
  maxLevel: 70,
  awakeningLevel: 1,
  stats: emptyStats(2000),
  testMode: 'verified-action',
  verifiedActionId: 'zero.blooming-gaze.awakening-one',
}), 60);

const hathorPayload = teamPayload(build('Hathor', {
  level: 80,
  maxLevel: 80,
  stats: emptyStats(2000),
  skills: { basic: 1, skill: 10, ultimate: 10, support: 1 },
  testMode: 'verified-action',
  verifiedActionId: 'hathor.cyclone-strike-third.level-10',
}));

const jiuyuanPayload = teamPayload(build('Jiuyuan', {
  level: 80,
  maxLevel: 80,
  awakeningLevel: 6,
  stats: emptyStats(2000),
  testMode: 'verified-action',
  verifiedActionId: 'jiuyuan.know-every-secret.awakening-six',
}));

const hanielPayload = payload([
  build('Shinku', { level: 80, maxLevel: 80, stats: emptyStats(1000) }),
  build('Haniel', {
    level: 80,
    maxLevel: 80,
    baseAtk: 500,
    activeTeamEffectIds: ['haniel.friendship.nova-atk-drain'],
    stats: emptyStats(1000),
  }),
  build('Zero', { level: 80, maxLevel: 80, stats: emptyStats(1000) }),
  build('Nanally', { level: 80, maxLevel: 80, stats: emptyStats(1000) }),
]);

const sakiriPayload = payload([
  build('Shinku', { level: 80, maxLevel: 80, stats: emptyStats(1000) }),
  build('Sakiri', {
    level: 80,
    maxLevel: 80,
    awakeningLevel: 4,
    baseAtk: 600,
    activeTeamEffectIds: [
      'sakiri.awakening-four.team-atk',
      'sakiri.impish-trick.def-reduction',
    ],
    stats: emptyStats(1000),
  }),
  build('Zero', { level: 80, maxLevel: 80, stats: emptyStats(1000) }),
  build('Nanally', { level: 80, maxLevel: 80, stats: emptyStats(1000) }),
]);

async function readJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function postVisible(value) {
  return readJson(endpoints.visibleCalculation, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function verifyOnce() {
  const [
    health,
    arcs,
    presets,
    characters,
    combatModels,
    cycles,
    rotations,
    progression,
    shinku,
    nanally,
    zero,
    hathor,
    jiuyuan,
    haniel,
    sakiri,
  ] = await Promise.all([
    readJson(endpoints.health),
    readJson(endpoints.arcs),
    readJson(endpoints.presets),
    readJson(endpoints.characters),
    readJson(endpoints.combatModels),
    readJson(endpoints.cycles),
    readJson(endpoints.rotations),
    readJson(endpoints.progression),
    postVisible(shinkuPayload),
    postVisible(nanallyPayload),
    postVisible(zeroPayload),
    postVisible(hathorPayload),
    postVisible(jiuyuanPayload),
    postVisible(hanielPayload),
    postVisible(sakiriPayload),
  ]);

  assert(health.ok === true, 'health.ok must be true');
  assert(health.version === expected.serviceVersion, `service version mismatch: ${health.version}`);
  assert(health.formulaVersion === expected.formulaVersion, `formula version mismatch: ${health.formulaVersion}`);
  assert(health.visibleBuildVersion === expected.visibleBuildVersion, 'visible build version mismatch');

  assert(arcs.count === 47, `expected 47 Arcs, got ${arcs.count}`);
  assert(presets.count === 8, `expected 8 Arc presets, got ${presets.count}`);
  assert(characters.count === 22 && characters.releasedCount === 20, 'character catalog contract mismatch');
  assert(cycles.count === 8 && cycles.pairCount === 6 && cycles.tripleCount === 2, 'Esper Cycle contract mismatch');
  assert(rotations.count === 6, `expected 6 rotations, got ${rotations.count}`);
  assert(progression.count === 20 && progression.stepCount === 6, 'progression contract mismatch');

  assert(combatModels.count === 20, `expected 20 combat coverage records, got ${combatModels.count}`);
  assert(combatModels.visibleBuildVersion === 1, 'combat model visible version mismatch');
  assert(combatModels.verifiedActionCount === expected.verifiedActionCount, `expected ${expected.verifiedActionCount} verified actions, got ${combatModels.verifiedActionCount}`);
  assert(combatModels.verifiedTeamEffectCount === 3, `expected 3 verified team effects, got ${combatModels.verifiedTeamEffectCount}`);
  assert(combatModels.verifiedTeamEffects.some((effect) => effect.id === 'haniel.friendship.nova-atk-drain' && effect.baseAtkPercent === 8), 'Haniel team effect missing');
  assert(combatModels.verifiedTeamEffects.some((effect) => effect.id === 'sakiri.awakening-four.team-atk' && effect.baseAtkPercent === 30), 'Sakiri A4 effect missing');
  assert(combatModels.verifiedTeamEffects.some((effect) => effect.id === 'sakiri.impish-trick.def-reduction' && effect.enemyDefenceReduction === 10), 'Sakiri DEF reduction missing');

  const partial = combatModels.data
    .filter((record) => record.coverage === 'partial')
    .map((record) => record.characterName)
    .sort();
  assert(JSON.stringify(partial) === JSON.stringify(expected.partialCharacters), `partial coverage mismatch: ${partial.join(', ')}`);
  assert(combatModels.verifiedActions.some((action) => action.id === 'chaos.remora-enhancement.maximum-twelve-seconds' && action.multiplier === 3200), 'Chaos capped Remora action missing');
  assert(combatModels.verifiedActions.some((action) => action.id === 'zero.blooming-gaze.awakening-one' && action.defenceIgnore === 75), 'Zero A1 action missing DEF Ignore');
  assert(combatModels.verifiedActions.some((action) => action.id === 'hathor.cyclone-strike-third.level-10' && Math.abs(action.multiplier - 1099.4) < 1e-9), 'Hathor third Cyclone Strike missing');
  assert(combatModels.verifiedActions.some((action) => action.id === 'jiuyuan.know-every-secret.awakening-six' && action.multiplier === 200 && action.minimumAwakening === 6), 'Jiuyuan A6 action missing');

  const shinkuRow = shinku.result.rows[0];
  assert(shinku.policy === 'game-visible-input-only', 'visible calculation policy mismatch');
  assert(shinkuRow.supported === true, 'Shinku reference must be supported');
  assert(shinkuRow.result.totalAtk === 2026, `Shinku final ATK must remain 2026, got ${shinkuRow.result.totalAtk}`);
  assert(shinkuRow.result.totalAtk !== 2596, 'Shinku Arc ATK was added twice');

  const nanallyRow = nanally.result.rows[0];
  assert(nanallyRow.supported === true, 'Nanally Fair Duel must be supported');
  assert(nanallyRow.multiplier === 129.5, `Nanally multiplier mismatch: ${nanallyRow.multiplier}`);

  const zeroRow = zero.result.rows[0];
  assert(zeroRow.supported === true, 'Zero Awakening 1 hit must be supported against a lower-level target');
  assert(zeroRow.multiplier === 200, `Zero multiplier mismatch: ${zeroRow.multiplier}`);
  assert(zeroRow.conditions.some((condition) => condition.id.endsWith('.defence-ignore')), 'Zero DEF Ignore provenance condition missing');

  const hathorRow = hathor.result.rows[0];
  assert(hathorRow.supported === true, 'Hathor third Cyclone Strike must be supported at Skill Lv.10');
  assert(Math.abs(hathorRow.multiplier - 1099.4) < 1e-9, `Hathor multiplier mismatch: ${hathorRow.multiplier}`);

  const jiuyuanRow = jiuyuan.result.rows[0];
  assert(jiuyuanRow.supported === true, 'Jiuyuan A6 trigger must be supported at A6');
  assert(jiuyuanRow.multiplier === 200, `Jiuyuan multiplier mismatch: ${jiuyuanRow.multiplier}`);
  assert(jiuyuanRow.conditions.some((condition) => condition.label.ru.includes('5 секунд')), 'Jiuyuan cooldown provenance missing');

  assert(haniel.result.teamEffects.length === 1 && haniel.result.teamEffects[0].active === true, 'Haniel effect evaluation missing');
  assert(haniel.result.teamEffects[0].derivedAmount === 40, `Haniel flat ATK mismatch: ${haniel.result.teamEffects[0].derivedAmount}`);
  assert(haniel.result.rows.every((row) => row.result.totalAtk === 1040), 'Haniel +40 ATK must reach all four slots');
  assert(haniel.result.rows.every((row) => row.conditions.some((condition) => condition.id.startsWith('haniel.friendship.nova-atk-drain'))), 'Haniel provenance missing');

  const sakiriEffects = sakiri.result.teamEffects;
  assert(sakiriEffects.length === 2 && sakiriEffects.every((effect) => effect.active === true), 'Sakiri effects must both be active');
  assert(sakiriEffects.find((effect) => effect.effect.id === 'sakiri.awakening-four.team-atk')?.derivedAmount === 180, 'Sakiri A4 +180 mismatch');
  assert(sakiri.result.rows[0].result.totalAtk === 1180, 'Sakiri A4 must buff slot 1');
  assert(sakiri.result.rows[1].result.totalAtk === 1000, 'Sakiri A4 must exclude Sakiri');
  assert(sakiri.result.rows[2].result.totalAtk === 1180 && sakiri.result.rows[3].result.totalAtk === 1180, 'Sakiri A4 must buff the other slots');
  assert(sakiri.result.rows.every((row) => row.conditions.some((condition) => condition.id.startsWith('sakiri.impish-trick.def-reduction'))), 'Sakiri DEF reduction provenance missing');

  return {
    combatModelCount: combatModels.count,
    verifiedActionCount: combatModels.verifiedActionCount,
    verifiedTeamEffectCount: combatModels.verifiedTeamEffectCount,
    partialCharacters: partial,
    shinkuAtk: shinkuRow.result.totalAtk,
    nanallyMultiplier: nanallyRow.multiplier,
    zeroMultiplier: zeroRow.multiplier,
    hathorMultiplier: hathorRow.multiplier,
    jiuyuanMultiplier: jiuyuanRow.multiplier,
    hanielFlatAtk: haniel.result.teamEffects[0].derivedAmount,
    sakiriFlatAtk: sakiriEffects.find((effect) => effect.effect.id === 'sakiri.awakening-four.team-atk')?.derivedAmount,
  };
}

let lastError;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    const result = await verifyOnce();
    console.log(JSON.stringify({ ok: true, attempt, base, ...result }, null, 2));
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.error(`Production contract attempt ${attempt}/30 failed: ${error instanceof Error ? error.message : String(error)}`);
    if (attempt < 30) await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

throw lastError ?? new Error('Production contract failed');
