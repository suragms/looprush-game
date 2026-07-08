import type { DailyChallenge } from '@/types';

/** Seeded PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

const CHALLENGE_POOL: Omit<DailyChallenge, 'id'>[] = [
  {
    title: 'Endurance',
    description: 'Survive for 90 seconds.',
    metric: 'survivalSec',
    target: 90,
  },
  {
    title: 'Combo King',
    description: 'Reach x10 combo.',
    metric: 'highestCombo',
    target: 10,
  },
  {
    title: 'Energy Collector',
    description: 'Collect 100 energy.',
    metric: 'energy',
    target: 100,
  },
  {
    title: 'Daredevil',
    description: 'Perform 15 near misses.',
    metric: 'nearMisses',
    target: 15,
  },
  {
    title: 'Level Up',
    description: 'Reach Level 5.',
    metric: 'level',
    target: 5,
  },
  {
    title: 'Long Haul',
    description: 'Survive for 180 seconds.',
    metric: 'survivalSec',
    target: 180,
  },
  {
    title: 'Combo Legend',
    description: 'Reach x20 combo.',
    metric: 'highestCombo',
    target: 20,
  },
  {
    title: 'Energy Hoarder',
    description: 'Collect 250 energy.',
    metric: 'energy',
    target: 250,
  },
];

export function generateDailyChallenges(dateStr: string): DailyChallenge[] {
  const rng = mulberry32(hashString(dateStr));
  const challenges: DailyChallenge[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < 3; i++) {
    let idx: number;
    do {
      idx = Math.floor(rng() * CHALLENGE_POOL.length);
    } while (usedIndices.has(idx));
    usedIndices.add(idx);

    const template = CHALLENGE_POOL[idx]!;
    challenges.push({
      id: `${dateStr}_${template.metric}_${template.target}`,
      ...template,
    });
  }

  return challenges;
}

/** Check if a run completes a daily challenge. */
export function checkDailyChallenge(
  challenge: DailyChallenge,
  run: { survivalSec: number; highestCombo: number; energy: number; nearMisses: number; level: number },
): boolean {
  switch (challenge.metric) {
    case 'survivalSec':
      return run.survivalSec >= challenge.target;
    case 'highestCombo':
      return run.highestCombo >= challenge.target;
    case 'energy':
      return run.energy >= challenge.target;
    case 'nearMisses':
      return run.nearMisses >= challenge.target;
    case 'level':
      return run.level >= challenge.target;
    default:
      return false;
  }
}

/** Get today's date string (YYYY-MM-DD) for daily challenges. */
export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
