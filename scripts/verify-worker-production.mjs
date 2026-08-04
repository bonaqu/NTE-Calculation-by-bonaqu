const base = String(process.env.DEPLOYMENT_URL || '').replace(/\/$/u, '');
if (!base) throw new Error('DEPLOYMENT_URL is required');

const expected = {
  serviceVersion: process.env.EXPECTED_SERVICE_VERSION || '0.7.0',
  formulaVersion: process.env.EXPECTED_FORMULA_VERSION || '0.2',
  visibleBuildVersion: Number(process.env.EXPECTED_VISIBLE_BUILD_VERSION || 1),
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
  stats: emptyStats(),
  arc: emptyArc(),
  skills: { basic: 1, skill: 1, ultimate: 1, support: 1 },
  console: { gridType: 0, typeThreeModules: 0 },
  testMode: 'neutral-reference',
  verifiedActionId: '',
  ...overrides,
});

const teamPayload = (primary, targetLevel = 80) => ({
  version: 1,
  activeSlot: 0,
  duration: 30,
  builds: [primary, build('Hathor'), build('Zero'), build('Nanally')],
  target: {
    level: targetLevel,
    resistance: 10,
    defenceReduction: 0,
    resistanceReduction: 0,
    boss: true,
  },
});

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

async function readJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function postVisible(payload) {
  return readJson(endpoints.visibleCalculation, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
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
  assert(combatModels.verifiedActionCount === 9, `expected 9 verified actions, got ${combatModels.verifiedActionCount}`);
  const partial = combatModels.data
    .filter((record) => record.coverage === 'partial')
    .map((record) => record.characterName)
    .sort();
  assert(JSON.stringify(partial) === JSON.stringify(['Chaos', 'Lacrimosa', 'Nanally', 'Shinku', 'Zero']), `partial coverage mismatch: ${partial.join(', ')}`);
  assert(combatModels.verifiedActions.some((action) => action.id === 'chaos.remora-enhancement.maximum-twelve-seconds' && action.multiplier === 3200), 'Chaos capped Remora action missing');
  assert(combatModels.verifiedActions.some((action) => action.id === 'zero.blooming-gaze.awakening-one' && action.defenceIgnore === 75), 'Zero A1 action missing DEF Ignore');

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

  return {
    combatModelCount: combatModels.count,
    verifiedActionCount: combatModels.verifiedActionCount,
    partialCharacters: partial,
    shinkuAtk: shinkuRow.result.totalAtk,
    nanallyMultiplier: nanallyRow.multiplier,
    zeroMultiplier: zeroRow.multiplier,
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
