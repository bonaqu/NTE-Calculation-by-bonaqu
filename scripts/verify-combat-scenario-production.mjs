const base = String(process.env.DEPLOYMENT_URL || '').replace(/\/$/u, '');
if (!base) throw new Error('DEPLOYMENT_URL is required');

const expectedVersion = Number(process.env.EXPECTED_COMBAT_SCENARIO_VERSION || 1);
const expectedEffectCount = Number(process.env.EXPECTED_VERIFIED_TEAM_EFFECT_COUNT || 4);
const expectedCycleModelCount = Number(process.env.EXPECTED_VERIFIED_COMBAT_CYCLE_MODEL_COUNT || 1);
const endpoints = {
  models: `${base}/api/v1/data/combat-models`,
  scenario: `${base}/api/v1/calculate/combat-scenario`,
};

const stats = (atk = 0, critRate = 0, critDamage = 0) => ({
  hp: 0,
  atk,
  def: 0,
  critRate,
  critDamage,
  damageBonus: 0,
  attributeDamageBonus: 0,
  chargeSpeed: 100,
  cycleIntensity: 0,
  breakIntensity: 0,
});

const arc = () => ({
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
  level: 80,
  maxLevel: 80,
  awakeningLevel: 0,
  baseAtk: 0,
  activeTeamEffectIds: [],
  stats: stats(1_000),
  arc: arc(),
  skills: { basic: 1, skill: 1, ultimate: 1, support: 1 },
  console: { gridType: 0, typeThreeModules: 0 },
  testMode: 'neutral-reference',
  verifiedActionId: '',
  ...overrides,
});

const target = {
  level: 80,
  resistance: 0,
  defenceReduction: 0,
  resistanceReduction: 0,
  boss: true,
};

const team = (builds, duration = 30) => ({
  version: 1,
  activeSlot: 0,
  duration,
  builds,
  target,
});

const scenarioStep = (id, at, kind, sourceSlot, fields = {}) => ({
  id,
  at,
  kind,
  sourceSlot,
  actionId: '',
  effectId: '',
  cycleId: '',
  note: '',
  ...fields,
});

const sakiriTeam = team([
  build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
  build('Sakiri', { awakeningLevel: 4, baseAtk: 600 }),
  build('Zero'),
  build('Nanally'),
]);
const sakiriScenario = {
  version: 1,
  name: 'Sakiri production duration boundary',
  steps: [
    scenarioStep('activate-sakiri-a4', 0, 'activate-effect', 1, { effectId: 'sakiri.awakening-four.team-atk' }),
    scenarioStep('sakiri-inside-window', 19.9, 'action', 0, { actionId: 'shinku.charge-enhancement.level-11' }),
    scenarioStep('sakiri-expired-window', 20, 'action', 0, { actionId: 'shinku.charge-enhancement.level-11' }),
  ],
};

const hathorTeam = team([
  build('Shinku', { stats: stats(1_000, 50, 100), skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
  build('Hathor', { stats: stats(1_000, 50, 100) }),
  build('Zero', { stats: stats(1_000, 50, 100) }),
  build('Nanally', { stats: stats(1_000, 50, 100) }),
], 20);
const hathorScenario = {
  version: 1,
  name: 'Hathor Remora production duration boundary',
  steps: [
    scenarioStep('activate-hathor-remora', 0, 'activate-effect', 1, { effectId: 'hathor.delay-warning.remora-crit-rate' }),
    scenarioStep('hathor-inside-window', 11.9, 'action', 0, { actionId: 'shinku.charge-enhancement.level-11' }),
    scenarioStep('hathor-expired-window', 12, 'action', 0, { actionId: 'shinku.charge-enhancement.level-11' }),
  ],
};

const stainTeam = team([
  build('Chaos'),
  build('Haniel'),
  build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
  build('Zero'),
], 20);
const stainScenario = {
  version: 1,
  name: 'Stain production duration boundary',
  steps: [
    scenarioStep('activate-stain', 0, 'activate-cycle', 0, { cycleId: 'stain' }),
    scenarioStep('stain-lakshana-inside', 11.9, 'action', 0, { actionId: 'chaos.remora-enhancement.maximum-twelve-seconds' }),
    scenarioStep('stain-cosmos-inside', 11.9, 'action', 2, { actionId: 'shinku.charge-enhancement.level-11' }),
    scenarioStep('stain-lakshana-expired', 12, 'action', 0, { actionId: 'chaos.remora-enhancement.maximum-twelve-seconds' }),
  ],
};

async function readJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function calculate(value, scenario) {
  return readJson(endpoints.scenario, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ team: value, scenario }),
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function step(calculation, id) {
  return calculation.result.steps.find((entry) => entry.step.id === id);
}

async function verifyOnce() {
  const [models, sakiri, hathor, stain] = await Promise.all([
    readJson(endpoints.models),
    calculate(sakiriTeam, sakiriScenario),
    calculate(hathorTeam, hathorScenario),
    calculate(stainTeam, stainScenario),
  ]);

  assert(models.combatScenarioVersion === expectedVersion, `scenario version mismatch: ${models.combatScenarioVersion}`);
  assert(models.verifiedTeamEffectCount === expectedEffectCount, `expected ${expectedEffectCount} team effects, got ${models.verifiedTeamEffectCount}`);
  assert(models.verifiedCombatCycleModelCount === expectedCycleModelCount, `expected ${expectedCycleModelCount} cycle model, got ${models.verifiedCombatCycleModelCount}`);
  assert(models.combatScenarioStepKinds.join(',') === 'action,activate-effect,activate-cycle,wait', 'scenario step kinds mismatch');
  assert(models.verifiedCombatCycleModels.some((model) => model.id === 'stain' && model.durationSeconds === 12 && model.damageBonus === 20), 'Stain model metadata missing');

  for (const calculation of [sakiri, hathor, stain]) {
    assert(calculation.combatScenarioVersion === expectedVersion, 'calculation scenario version mismatch');
    assert(calculation.policy === 'verified-actions-timed-effects-and-supported-cycles-only', 'scenario policy mismatch');
    assert(calculation.result.coveragePercent === 100, `scenario coverage mismatch: ${calculation.result.coveragePercent}`);
  }

  const sakiriInside = step(sakiri, 'sakiri-inside-window');
  const sakiriExpired = step(sakiri, 'sakiri-expired-window');
  assert(sakiriInside?.calculation?.result?.totalAtk === 1_180, 'Sakiri inside ATK must be 1180');
  assert(sakiriExpired?.calculation?.result?.totalAtk === 1_000, 'Sakiri expired ATK must be 1000');

  const hathorInside = step(hathor, 'hathor-inside-window');
  const hathorExpired = step(hathor, 'hathor-expired-window');
  assert(hathorInside?.calculation?.result?.expectedCritMultiplier === 1.6, 'Hathor inside expected CRIT multiplier must be 1.6');
  assert(hathorExpired?.calculation?.result?.expectedCritMultiplier === 1.5, 'Hathor expired expected CRIT multiplier must be 1.5');

  const stainInside = step(stain, 'stain-lakshana-inside');
  const stainUnrelated = step(stain, 'stain-cosmos-inside');
  const stainExpired = step(stain, 'stain-lakshana-expired');
  assert(stain.result.activatedCycleCount === 1, 'Stain activation missing');
  assert(stainInside?.activeCycles.some((entry) => entry.cycleId === 'stain'), 'Stain active-cycle provenance missing');
  assert(stainExpired?.activeCycles.length === 0, 'Stain remained active at 12 seconds');
  assert(stainInside?.calculation?.conditions.some((condition) => condition.id === 'cycle.stain.target-window'), 'Stain Lakshana condition missing');
  assert(!stainUnrelated?.calculation?.conditions.some((condition) => condition.id === 'cycle.stain.target-window'), 'Stain affected unrelated Cosmos action');
  assert(Math.abs(stainInside.calculation.result.expected - stainExpired.calculation.result.expected * 1.2) < 1e-7, 'Stain did not apply exactly +20% damage');
  assert(stainInside.calculation.result.totalAtk === stainExpired.calculation.result.totalAtk, 'Stain changed final ATK');

  return {
    combatScenarioVersion: stain.combatScenarioVersion,
    verifiedTeamEffectCount: models.verifiedTeamEffectCount,
    verifiedCombatCycleModelCount: models.verifiedCombatCycleModelCount,
    sakiriInsideWindowAtk: sakiriInside.calculation.result.totalAtk,
    hathorInsideExpectedCritMultiplier: hathorInside.calculation.result.expectedCritMultiplier,
    stainInsideExpected: stainInside.calculation.result.expected,
    stainExpiredExpected: stainExpired.calculation.result.expected,
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
    console.error(`Combat scenario production attempt ${attempt}/30 failed: ${error instanceof Error ? error.message : String(error)}`);
    if (attempt < 30) await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

throw lastError ?? new Error('Combat scenario production contract failed');
