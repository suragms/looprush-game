import type { PlayerStats } from '@/types';

export interface UnlockCondition {
  name: string;
  description: string;
  check: (stats: PlayerStats) => boolean;
}

export const UNLOCK_CONDITIONS: Record<string, UnlockCondition> = {
  orb_magenta: {
    name: 'Magenta Orb',
    description: 'Score 5,000+ total.',
    check: (s) => s.highScore >= 5000,
  },
  orb_green: {
    name: 'Plasma Orb',
    description: 'Play 25 games.',
    check: (s) => s.gamesPlayed >= 25,
  },
  orb_yellow: {
    name: 'Solar Orb',
    description: 'Reach Level 8.',
    check: (s) => s.maxLevel >= 8,
  },
  orb_purple: {
    name: 'Void Orb',
    description: 'Reach x10 combo ever.',
    check: (s) => s.highestCombo >= 10,
  },
  orb_orange: {
    name: 'Ember Orb',
    description: 'Score 20,000+ total.',
    check: (s) => s.highScore >= 20000,
  },
  trail_comet: {
    name: 'Comet Trail',
    description: 'Collect 500 total energy.',
    check: (s) => s.totalEnergy >= 500,
  },
  trail_spark: {
    name: 'Spark Trail',
    description: 'Perform 50 near misses.',
    check: (s) => s.nearMisses >= 50,
  },
  dash_burst: {
    name: 'Burst Dash',
    description: 'Use 100 dashes (dodge 50 via dash).',
    check: (s) => s.dashDodges >= 50,
  },
  dash_shock: {
    name: 'Shock Dash',
    description: 'Reach Level 12.',
    check: (s) => s.maxLevel >= 12,
  },
  theme_abyss: {
    name: 'Abyss Theme',
    description: 'Reach Level 10.',
    check: (s) => s.maxLevel >= 10,
  },
  theme_rose: {
    name: 'Rose Theme',
    description: 'Play 50 games.',
    check: (s) => s.gamesPlayed >= 50,
  },
};

export function checkUnlocks(stats: PlayerStats, owned: string[]): string[] {
  const newUnlocks: string[] = [];
  for (const [id, cond] of Object.entries(UNLOCK_CONDITIONS)) {
    if (!owned.includes(id) && cond.check(stats)) {
      newUnlocks.push(id);
    }
  }
  return newUnlocks;
}
