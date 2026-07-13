/**
 * Gameplay balance / difficulty tuning.
 *
 * All functions are pure and unit-tested (see src/tests).
 * Difficulty rises continuously and never creates unavoidable deaths:
 * every new obstacle type has generous telegraphs and caps out.
 */

// ---------------------------------------------------------------------------
// Level tiers — every 3 levels belongs to a named themed tier.
// ---------------------------------------------------------------------------

const TIER_NAMES = [
  'Ignition',
  'Overdrive',
  'Neon Storm',
  'Rush Hour',
  'Chaos Zone',
  'Redline',
  'Singularity',
  'Void Runner',
] as const;

/** Number of levels per tier. */
const LEVELS_PER_TIER = 3;

/** Total unique tier names before suffix repetition. */
const BASE_TIER_COUNT = TIER_NAMES.length;

export interface LevelTier {
  index: number;
  name: string;
  startLevel: number;
}

/**
 * Build the full tier list (repeating with "2", "3"... suffixes).
 * We pre-compute enough tiers to cover any reasonable play session.
 */
function buildTierList(): LevelTier[] {
  const tiers: LevelTier[] = [];
  let repeat = 0;
  for (let i = 0; i < 200; i++) {
    const baseIdx = i % BASE_TIER_COUNT;
    const suffix = repeat > 0 ? ' ' + String(repeat + 1) : '';
    tiers.push({
      index: i,
      name: TIER_NAMES[baseIdx] + suffix,
      startLevel: i * LEVELS_PER_TIER + 1,
    });
    if (baseIdx === BASE_TIER_COUNT - 1) repeat++;
  }
  return tiers;
}

const LEVEL_TIERS = buildTierList();

/** Returns the named tier a given level belongs to. */
export function levelTierName(level: number): string {
  const idx = levelTierIndex(level);
  return LEVEL_TIERS[idx]?.name ?? 'Unknown';
}

/** Returns the 0-based tier index for a given level. */
export function levelTierIndex(level: number): number {
  return Math.max(0, Math.floor((level - 1) / LEVELS_PER_TIER));
}

/**
 * Returns true when the level just entered a new tier (every 3 levels).
 * Level 1 is always a milestone (first tier).
 */
export function isLevelMilestone(level: number): boolean {
  if (level <= 1) return true;
  return (level - 1) % LEVELS_PER_TIER === 0;
}

export const BALANCE = {
  player: {
    /** Max speed in pixels/second at base difficulty. */
    baseSpeed: 420,
    /** Per-combo-tier speed bonus (px/s), capped by comboTierSpeedCap. */
    comboSpeedPerTier: 14,
    comboTierSpeedCap: 180,
    radius: 18,
  },
  dash: {
    /** Dash velocity (px/s). */
    speed: 1150,
    /** Dash active time (s). */
    duration: 0.16,
    /** Invulnerability after dash ends (s). */
    invulnAfter: 0.12,
    /** Cooldown (s). */
    cooldown: 1.4,
  },
  energy: {
    radius: 12,
    /** Score granted per pickup at x1 combo. */
    baseScore: 10,
    /** Seconds without a pickup before combo begins decaying. */
    comboGrace: 1.6,
    goldBaseScore: 80,
  },
  combo: {
    /** Time window (s) after which combo drops a tier. */
    decayTime: 3.2,
    tiers: [1, 2, 3, 5, 10, 20] as const,
    /** Speed multiplier applied to obstacles at each tier. */
    obstacleSpeedPerTier: 0.025,
  },
  difficulty: {
    /** Seconds per level. */
    levelDuration: 30,
    /** Obstacle base speed at level 1 (px/s). */
    obstacleBaseSpeed: 90,
    /** Additive px/s per level. */
    obstacleSpeedPerLevel: 22,
    /** Max additive px/s from levels (caps difficulty). */
    obstacleSpeedCap: 320,
    /** Spawn interval at level 1 (s). */
    spawnIntervalStart: 1.6,
    /** Minimum spawn interval reached at high levels (s). */
    spawnIntervalMin: 0.45,
    /** Interval reduction per level (s). */
    spawnIntervalReduction: 0.07,
  },
  nearMiss: {
    /** Distance (px) within which a pass counts as a near miss. */
    distance: 34,
    /** Score granted per near miss at x1 combo. */
    score: 100,
    /** Cooldown per obstacle so one dodge doesn't multi-count (s). */
    perObstacleCooldown: 0.8,
  },
} as const;

/** Combo tiers, ascending. */
const COMBO_TIERS = [...BALANCE.combo.tiers];

/** Find the combo tier (multiplier) for a given combo count. */
export function comboMultiplier(combo: number): number {
  let mult = 1;
  for (const t of COMBO_TIERS) {
    if (combo >= t) mult = t;
    else break;
  }
  return mult;
}

/** Index of the current combo tier (0-based) for animation intensity. */
export function comboTierIndex(combo: number): number {
  let idx = 0;
  for (let i = 0; i < COMBO_TIERS.length; i++) {
    const tier = COMBO_TIERS[i];
    if (tier !== undefined && combo >= tier) idx = i;
    else break;
  }
  return idx;
}

/**
 * Difficulty level for a given survival time.
 * Level 1 at t=0, increments every levelDuration seconds.
 */
export function levelForTime(survivalSec: number): number {
  return 1 + Math.floor(survivalSec / BALANCE.difficulty.levelDuration);
}

/** Obstacle speed (px/s) at a given level. */
export function obstacleSpeedForLevel(level: number): number {
  const add = (level - 1) * BALANCE.difficulty.obstacleSpeedPerLevel;
  const capped = Math.min(add, BALANCE.difficulty.obstacleSpeedCap);
  return BALANCE.difficulty.obstacleBaseSpeed + capped;
}

/** Spawn interval (s) at a given level. */
export function spawnIntervalForLevel(level: number): number {
  const reduction = (level - 1) * BALANCE.difficulty.spawnIntervalReduction;
  return Math.max(
    BALANCE.difficulty.spawnIntervalMin,
    BALANCE.difficulty.spawnIntervalStart - reduction,
  );
}

/**
 * Score awarded for an energy pickup.
 * Pure: deterministic from inputs.
 */
export function energyPickupScore(
  combo: number,
  isGold: boolean,
): number {
  const base = isGold ? BALANCE.energy.goldBaseScore : BALANCE.energy.baseScore;
  return Math.round(base * comboMultiplier(combo));
}

/**
 * Survival score contribution per tick.
 * @param deltaSec seconds elapsed this tick.
 * @param level current difficulty level.
 * @param combo current combo count.
 */
export function survivalTickScore(
  deltaSec: number,
  level: number,
  combo: number,
): number {
  // 2 points/sec * level, scaled by combo multiplier.
  const perSec = 2 * level;
  return Math.round(perSec * deltaSec * comboMultiplier(combo));
}

/** Player movement speed at a given combo tier. */
export function playerSpeedForCombo(combo: number): number {
  const tier = comboTierIndex(combo);
  const bonus = Math.min(
    tier * BALANCE.player.comboSpeedPerTier,
    BALANCE.player.comboTierSpeedCap,
  );
  return BALANCE.player.baseSpeed + bonus;
}

/** Obstacle speed multiplier contributed by the current combo (risk). */
export function obstacleSpeedComboMultiplier(combo: number): number {
  const tier = comboTierIndex(combo);
  return 1 + tier * BALANCE.combo.obstacleSpeedPerTier;
}
