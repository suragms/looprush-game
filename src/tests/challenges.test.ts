import { describe, it, expect } from 'vitest';
import { generateDailyChallenges, checkDailyChallenge, todayKey } from '@/game/config/challenges';

describe('generateDailyChallenges', () => {
  it('generates 3 challenges', () => {
    const challenges = generateDailyChallenges('2026-07-08');
    expect(challenges).toHaveLength(3);
  });

  it('same date produces same challenges (deterministic)', () => {
    const a = generateDailyChallenges('2026-07-08');
    const b = generateDailyChallenges('2026-07-08');
    expect(a).toEqual(b);
  });

  it('different date produces different challenges', () => {
    const a = generateDailyChallenges('2026-07-08');
    const b = generateDailyChallenges('2026-07-09');
    // They could coincidentally match, but extremely unlikely
    // Just verify IDs differ
    const aIds = a.map((c) => c.id);
    const bIds = b.map((c) => c.id);
    expect(aIds).not.toEqual(bIds);
  });

  it('challenges have required fields', () => {
    const challenges = generateDailyChallenges('2026-01-01');
    for (const ch of challenges) {
      expect(ch.id).toBeTruthy();
      expect(ch.title).toBeTruthy();
      expect(ch.description).toBeTruthy();
      expect(ch.target).toBeGreaterThan(0);
      expect(['survivalSec', 'highestCombo', 'energy', 'nearMisses', 'level']).toContain(ch.metric);
    }
  });
});

describe('checkDailyChallenge', () => {
  it('matches survival challenge', () => {
    const ch = { id: 'test', title: 'T', description: 'D', metric: 'survivalSec' as const, target: 90 };
    expect(checkDailyChallenge(ch, { survivalSec: 100, highestCombo: 0, energy: 0, nearMisses: 0, level: 1 })).toBe(true);
    expect(checkDailyChallenge(ch, { survivalSec: 50, highestCombo: 0, energy: 0, nearMisses: 0, level: 1 })).toBe(false);
  });

  it('matches combo challenge', () => {
    const ch = { id: 'test', title: 'T', description: 'D', metric: 'highestCombo' as const, target: 10 };
    expect(checkDailyChallenge(ch, { survivalSec: 0, highestCombo: 12, energy: 0, nearMisses: 0, level: 1 })).toBe(true);
    expect(checkDailyChallenge(ch, { survivalSec: 0, highestCombo: 5, energy: 0, nearMisses: 0, level: 1 })).toBe(false);
  });
});

describe('todayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const key = todayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
