const base = String(process.env.DEPLOYMENT_URL || '').replace(/\/$/u, '');
if (!base) throw new Error('DEPLOYMENT_URL is required');

const expectedVersion = Number(process.env.EXPECTED_COMBAT_SCENARIO_VERSION || 1);
const endpoints = {
  models: `${base}/api/v1/data/combat-models`,
  scenario: `${base}/api/v1/calculate/combat-scenario`,
};

const stats = (atk = 0) => ({
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

const team = {
  version: 1,
  activeSlot: 0,
  duration: 30,
  builds: [
    build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
    build('Sakiri', { awakeningLevel: 4, baseAtk: 600 }),
    build('Zero'),
    build('Nanally'),
  ],
  target: {
    level: 80,
    resistance: 0,
    defenceReduction: 0,
    resistanceReduction: 0,
    boss: true,
  },
};

const scenario = {
  version: 1,
  name: 'Production duration boundary',
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
      id: 'inside-window',
      at: 19.9,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      note: '',
    },
    {
      id: 'expired-window',
      at: 20,
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function verifyOnce() {
  const [models, calculation] = await Promise.all([
    readJson(endpoints.models),
    readJson(endpoints.scenario, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ team, scenario }),
    }),
  ]);

  assert(models.combatScenarioVersion === expectedVersion, `combat scenario model version mismatch: ${models.combatScenarioVersion}`);
  assert(Array.isArray(models.combatScenarioStepKinds), 'combat scenario step kinds missing');
  assert(models.combatScenarioStepKinds.join(',') === 'action,activate-effect,wait', 'combat scenario step kinds mismatch');
  assert(calculation.combatScenarioVersion === expectedVersion, `calculation scenario version mismatch: ${calculation.combatScenarioVersion}`);
  assert(calculation.policy === 'verified-actions-and-timed-effects-only', 'scenario policy mismatch');
  assert(calculation.result.activatedEffectCount === 1, 'Sakiri A4 activation missing');
  assert(calculation.result.calculatedActionCount === 2, 'expected two calculated Shinku actions');
  assert(calculation.result.coveragePercent === 100, `scenario coverage mismatch: ${calculation.result.coveragePercent}`);

  const inside = calculation.result.steps.find((entry) => entry.step.id === 'inside-window');
  const expired = calculation.result.steps.find((entry) => entry.step.id === 'expired-window');
  assert(inside?.calculation?.result?.totalAtk === 1_180, `inside-window ATK must be 1180, got ${inside?.calculation?.result?.totalAtk}`);
  assert(expired?.calculation?.result?.totalAtk === 1_000, `expired-window ATK must be 1000, got ${expired?.calculation?.result?.totalAtk}`);
  assert(inside.activeEffects.some((entry) => entry.effectId === 'sakiri.awakening-four.team-atk'), 'inside-window active effect provenance missing');
  assert(expired.activeEffects.length === 0, 'expired effect remained active at 20 seconds');

  return {
    combatScenarioVersion: calculation.combatScenarioVersion,
    insideWindowAtk: inside.calculation.result.totalAtk,
    expiredWindowAtk: expired.calculation.result.totalAtk,
    coveragePercent: calculation.result.coveragePercent,
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
