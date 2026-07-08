import type { PlayerStats, RunResult } from '@/types';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  /** Returns true if the achievement should be unlocked. */
  check: (stats: PlayerStats, run?: RunResult) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'FIRST_RUN',
    name: 'First Run',
    description: 'Play your first game.',
    check: (s) => s.gamesPlayed >= 1,
  },
  {
    id: 'SURVIVOR',
    name: 'Survivor',
    description: 'Survive for 2 minutes in a single run.',
    check: (_s, r) => (r?.survivalSec ?? 0) >= 120,
  },
  {
    id: 'UNTOUCHABLE',
    name: 'Untouchable',
    description: 'Reach Level 5 in a single run.',
    check: (_s, r) => (r?.level ?? 0) >= 5,
  },
  {
    id: 'COMBO_MASTER',
    name: 'Combo Master',
    description: 'Reach x20 combo.',
    check: (_s, r) => (r?.highestCombo ?? 0) >= 20,
  },
  {
    id: 'DASH_MASTER',
    name: 'Dash Master',
    description: 'Dodge 25 obstacles using Dash.',
    check: (s) => s.dashDodges >= 25,
  },
  {
    id: 'ENERGY_HUNTER',
    name: 'Energy Hunter',
    description: 'Collect 1,000 total energy.',
    check: (s) => s.totalEnergy >= 1000,
  },
  {
    id: 'VETERAN',
    name: 'Veteran',
    description: 'Play 100 games.',
    check: (s) => s.gamesPlayed >= 100,
  },
  {
    id: 'NEAR_MISS_PRO',
    name: 'Near Miss Pro',
    description: 'Perform 100 near misses total.',
    check: (s) => s.nearMisses >= 100,
  },
  {
    id: 'HIGH_SCORER',
    name: 'High Scorer',
    description: 'Score 10,000+ in a single run.',
    check: (_s, r) => (r?.score ?? 0) >= 10000,
  },
];

export function checkAchievements(
  stats: PlayerStats,
  run: RunResult | undefined,
  alreadyUnlocked: Set<string>,
): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !alreadyUnlocked.has(a.id) && a.check(stats, run));
}
