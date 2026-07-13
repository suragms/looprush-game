import { describe, it, expect } from 'vitest';
import {
  comboMultiplier,
  comboTierIndex,
  energyPickupScore,
  levelForTime,
  obstacleSpeedForLevel,
  spawnIntervalForLevel,
  survivalTickScore,
  playerSpeedForCombo,
  obstacleSpeedComboMultiplier,
  levelTierName,
  levelTierIndex,
  isLevelMilestone,
} from '@/game/config/balance';

describe('comboMultiplier', () => {
  it('returns x1 for combo 0', () => expect(comboMultiplier(0)).toBe(1));
  it('returns x1 for combo 1', () => expect(comboMultiplier(1)).toBe(1));
  it('returns x2 for combo 2', () => expect(comboMultiplier(2)).toBe(2));
  it('returns x3 for combo 3', () => expect(comboMultiplier(3)).toBe(3));
  it('returns x5 for combo 5', () => expect(comboMultiplier(5)).toBe(5));
  it('returns x10 for combo 10', () => expect(comboMultiplier(10)).toBe(10));
  it('returns x20 for combo 20', () => expect(comboMultiplier(20)).toBe(20));
  it('returns x20 for combo 50 (capped)', () => expect(comboMultiplier(50)).toBe(20));
});

describe('comboTierIndex', () => {
  it('returns 0 for combo 0', () => expect(comboTierIndex(0)).toBe(0));
  it('returns 1 for combo 2', () => expect(comboTierIndex(2)).toBe(1));
  it('returns 5 for combo 20', () => expect(comboTierIndex(20)).toBe(5));
});

describe('energyPickupScore', () => {
  it('base energy at x1 combo', () => expect(energyPickupScore(0, false)).toBe(10));
  it('gold at x1', () => expect(energyPickupScore(0, true)).toBe(80));
  it('base energy at x5', () => expect(energyPickupScore(5, false)).toBe(50));
  it('gold at x10', () => expect(energyPickupScore(10, true)).toBe(800));
});

describe('levelForTime', () => {
  it('level 1 at start', () => expect(levelForTime(0)).toBe(1));
  it('level 2 at 30s', () => expect(levelForTime(30)).toBe(2));
  it('level 3 at 60s', () => expect(levelForTime(60)).toBe(3));
  it('level 5 at 120s', () => expect(levelForTime(120)).toBe(5));
});

describe('obstacleSpeedForLevel', () => {
  it('level 1 base speed', () => expect(obstacleSpeedForLevel(1)).toBe(90));
  it('level 2 faster', () => expect(obstacleSpeedForLevel(2)).toBeGreaterThan(90));
  it('does not exceed cap', () => {
    const speed = obstacleSpeedForLevel(100);
    expect(speed).toBeLessThanOrEqual(90 + 320);
  });
});

describe('spawnIntervalForLevel', () => {
  it('level 1 is slowest spawn', () => {
    const interval = spawnIntervalForLevel(1);
    expect(interval).toBeLessThanOrEqual(1.6);
  });
  it('never goes below minimum', () => {
    const interval = spawnIntervalForLevel(100);
    expect(interval).toBeGreaterThanOrEqual(0.45);
  });
});

describe('survivalTickScore', () => {
  it('1 second at level 1 x1 = 2', () => {
    expect(survivalTickScore(1, 1, 0)).toBe(2);
  });
  it('1 second at level 2 x5 = 20', () => {
    expect(survivalTickScore(1, 2, 5)).toBe(20);
  });
});

describe('playerSpeedForCombo', () => {
  it('base speed at combo 0', () => {
    expect(playerSpeedForCombo(0)).toBe(420);
  });
  it('faster at high combo', () => {
    expect(playerSpeedForCombo(20)).toBeGreaterThan(420);
  });
  it('capped', () => {
    const speed = playerSpeedForCombo(999);
    expect(speed).toBeLessThanOrEqual(420 + 180);
  });
});

describe('obstacleSpeedComboMultiplier', () => {
  it('1.0 at combo 0', () => {
    expect(obstacleSpeedComboMultiplier(0)).toBe(1);
  });
  it('greater than 1 at high combo', () => {
    expect(obstacleSpeedComboMultiplier(20)).toBeGreaterThan(1);
  });
});

describe('levelTierIndex', () => {
  it('tier 0 for level 1', () => expect(levelTierIndex(1)).toBe(0));
  it('tier 0 for level 2', () => expect(levelTierIndex(2)).toBe(0));
  it('tier 0 for level 3', () => expect(levelTierIndex(3)).toBe(0));
  it('tier 1 for level 4', () => expect(levelTierIndex(4)).toBe(1));
  it('tier 1 for level 6', () => expect(levelTierIndex(6)).toBe(1));
  it('tier 2 for level 7', () => expect(levelTierIndex(7)).toBe(2));
  it('tier 5 for level 16', () => expect(levelTierIndex(16)).toBe(5));
});

describe('levelTierName', () => {
  it('Ignition for level 1', () => expect(levelTierName(1)).toBe('Ignition'));
  it('Overdrive for level 4', () => expect(levelTierName(4)).toBe('Overdrive'));
  it('Neon Storm for level 7', () => expect(levelTierName(7)).toBe('Neon Storm'));
  it('wraps with suffix for high tiers', () => {
    // tier index 8 = back to Ignition with suffix "2"
    const name = levelTierName(25);
    expect(name).toContain('Ignition');
  });
});

describe('isLevelMilestone', () => {
  it('level 1 is a milestone', () => expect(isLevelMilestone(1)).toBe(true));
  it('level 2 is not a milestone', () => expect(isLevelMilestone(2)).toBe(false));
  it('level 3 is not a milestone', () => expect(isLevelMilestone(3)).toBe(false));
  it('level 4 is a milestone', () => expect(isLevelMilestone(4)).toBe(true));
  it('level 7 is a milestone', () => expect(isLevelMilestone(7)).toBe(true));
  it('level 10 is a milestone', () => expect(isLevelMilestone(10)).toBe(true));
  it('level 11 is not a milestone', () => expect(isLevelMilestone(11)).toBe(false));
});
