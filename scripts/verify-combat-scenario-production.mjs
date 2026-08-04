const base = String(process.env.DEPLOYMENT_URL || '').replace(/\/$/u, '');
if (!base) throw new Error('DEPLOYMENT_URL is required');

const expectedVersion = Number(process.env.EXPECTED_COMBAT_SCENARIO_VERSION || 1);
const expectedEffectCount = Number(process.env.EXPECTED_VERIFIED_TEAM_EFFECT_COUNT || 4);
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

const sakiriTeam = {
  version: 1,
  activeSlot: 0,
  duration: 30,
  builds: [
    build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
    build('Sakiri', { awakeningLevel: 4, baseAtk: 600 }),
    build('Zero'),
    build('Nanally'),
  ],
  target,
};

const sakiriScenario = {
  version: 1,
  name: 'Sakiri production duration boundary',
  steps: [
    {
      id: 'activate-sakiri-a4',
      at: 0,
      kind: 'activate-effect',
      sourceSlot: 1,
      actionId: '',
      effectId: 'sakiri.awakening-four.team-atk',
      note: '',
    },
    {
      id: 'sakiri-inside-window',
      at: 19.9,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      note: '',
    },
    {
      id: 'sakiri-expired-window',
      at: 20,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      note: '',
    },
  ],
};

const hathorTeam = {
  version: 1,
  activeSlot: 0,
  duration: 20,
  builds: [
    build('Shinku', {
      stats: stats(1_000, 50, 100),
      skills: { basic: 11, skill: 1, ultimate: 1, support: 1 },
    }),
    build('Hathor', { stats: stats(1_000, 50, 100) }),
    build('Zero', { stats: stats(1_000, 50, 100) }),
    build('Nanally', { stats: stats(1_000, 50, 100) }),
  ],
  target,
};

const hathorScenario = {
  version: 1,
  name: 'Hathor Remora production duration boundary',
  steps: [
    {
      id: 'activate-hathor-remora',
      at: 0,
      kind: 'activate-effect',
      sourceSlot: 1,
      actionId: '',
      effectId: 'hathor.delay-warning.remora-crit-rate',
      note: '',
    },
    {
      id: 'hathor-inside-window',
      at: 11.9,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      note: '',
    },
    {
      id: 'hathor-expired-window',
      at: 12,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      note: '',
    },
  ],
};

async function readJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function calculate(team, scenario) {
  return readJson(endpoints.scenario, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ team, scenario }),
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function step(calculation, id) {
  return calculation.result.steps.find((entry) => entry.step.id === id);
}

async function verifyOnce() {
  const [models, sakiri, hathor] = await Promise.all([
    readJson(endpoints.models),
    calculate(sakiriTeam, sakiriScenario),
    calculate(hathorTeam, hathorScenario),
  ]);

  assert(models.combatScenarioVersion === expectedVersion, `combat scenario model version mismatch: ${models.combatScenarioVersion}`);
  assert(models.verifiedTeamEffectCount === expectedEffectCount, `expected ${expectedEffectCount} verified team effects, got ${models.verifiedTeamEffectCount}`);
  assert(models.verifiedTeamEffects.some((effect) => effect.id === 'hathor.delay-warning.remora-crit-rate' && effect.critRate === 10 && effect.durationSeconds === 12), 'Hathor Remora effect metadata missing');
  assert(Array.isArray(models.combatScenarioStepKinds), 'combat scenario step kinds missing');
  assert(models.combatScenarioStepKinds.join(',') === 'action,activate-effect,wait', 'combat scenario step kinds mismatch');

  for (const calculation of [sakiri, hathor]) {
    assert(calculation.combatScenarioVersion === expectedVersion, `calculation scenario version mismatch: ${calculation.combatScenarioVersion}`);
    assert(calculation.policy === 'verified-actions-and-timed-effects-only', 'scenario policy mismatch');
    assert(calculation.result.activatedEffectCount === 1, 'effect activation missing');
    assert(calculation.result.calculatedActionCount === 2, 'expected two calculated actions');
    assert(calculation.result.coveragePercent === 100, `scenario coverage mismatch: ${calculation.result.coveragePercent}`);
  }

  const sakiriInside = step(sakiri, 'sakiri-inside-window');
  const sakiriExpired = step(sakiri, 'sakiri-expired-window');
  assert(sakiriInside?.calculation?.result?.totalAtk === 1_180, `Sakiri inside-window ATK must be 1180, got ${sakiriInside?.calculation?.result?.totalAtk}`);
  assert(sakiriExpired?.calculation?.result?.totalAtk === 1_000, `Sakiri expired-window ATK must be 1000, got ${sakiriExpired?.calculation?.result?.totalAtk}`);
  assert(sakiriInside.activeEffects.some((entry) => entry.effectId === 'sakiri.awakening-four.team-atk'), 'Sakiri active effect provenance missing');
  assert(sakiriExpired.activeEffects.length === 0, 'Sakiri effect remained active at 20 seconds');

  const hathorInside = step(hathor, 'hathor-inside-window');
  const hathorExpired = step(hathor, 'hathor-expired-window');
  assert(hathorInside?.calculation?.result?.totalAtk === 1_000, `Hathor effect must not change ATK, got ${hathorInside?.calculation?.result?.totalAtk}`);
  assert(hathorExpired?.calculation?.result?.totalAtk === 1_000, `expired Hathor ATK mismatch: ${hathorExpired?.calculation?.result?.totalAtk}`);
  assert(hathorInside?.calculation?.result?.expectedCritMultiplier === 1.6, `inside Remora expected CRIT multiplier must be 1.6, got ${hathorInside?.calculation?.result?.expectedCritMultiplier}`);
  assert(hathorExpired?.calculation?.result?.expectedCritMultiplier === 1.5, `expired Remora expected CRIT multiplier must be 1.5, got ${hathorExpired?.calculation?.result?.expectedCritMultiplier}`);
  assert(hathorInside.calculation.result.expected > hathorExpired.calculation.result.expected, 'Remora CRIT Rate did not increase expected damage');
  assert(hathorInside.activeEffects.some((entry) => entry.effectId === 'hathor.delay-warning.remora-crit-rate'), 'Hathor active effect provenance missing');
  assert(hathorExpired.activeEffects.length === 0, 'Hathor effect remained active at 12 seconds');

  return {
    combatScenarioVersion: hathor.combatScenarioVersion,
    verifiedTeamEffectCount: models.verifiedTeamEffectCount,
    sakiriInsideWindowAtk: sakiriInside.calculation.result.totalAtk,
    sakiriExpiredWindowAtk: sakiriExpired.calculation.result.totalAtk,
    hathorInsideExpectedCritMultiplier: hathorInside.calculation.result.expectedCritMultiplier,
    hathorExpiredExpectedCritMultiplier: hathorExpired.calculation.result.expectedCritMultiplier,
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
