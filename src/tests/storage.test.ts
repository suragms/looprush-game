import { describe, it, expect } from 'vitest';
import { validateSaveData, validateSettings, validateAchievements } from '@/storage/validate';
import { migrate } from '@/storage/migration';
import { defaultSaveData, DEFAULT_SETTINGS } from '@/storage/defaults';

describe('validateSaveData', () => {
  it('returns defaults for null', () => {
    const result = validateSaveData(null);
    expect(result.version).toBe(1);
    expect(result.stats.highScore).toBe(0);
  });

  it('returns defaults for non-object', () => {
    expect(validateSaveData('bad').stats.highScore).toBe(0);
    expect(validateSaveData(42).stats.highScore).toBe(0);
    expect(validateSaveData([1, 2]).stats.highScore).toBe(0);
  });

  it('passes through valid data', () => {
    const def = defaultSaveData();
    const result = validateSaveData(def);
    expect(result.version).toBe(1);
    expect(result.stats.highScore).toBe(0);
  });

  it('fixes negative values', () => {
    const result = validateSaveData({
      version: 1,
      stats: { highScore: -100, gamesPlayed: -5, totalSurvivalSec: -1, highestCombo: -1, maxLevel: -1, totalEnergy: -1, nearMisses: -1, powerupsCollected: -1, dashDodges: -1 },
      achievements: {},
      cosmetics: { owned: [], equipped: { orb: '', trail: '', dash: '', theme: '' } },
      daily: {},
      settings: DEFAULT_SETTINGS,
    });
    expect(result.stats.highScore).toBe(0);
    expect(result.stats.maxLevel).toBe(1);
  });

  it('handles missing fields gracefully', () => {
    const result = validateSaveData({ version: 1 });
    expect(result.stats.highScore).toBe(0);
    expect(result.settings.music).toBe(true);
  });
});

describe('validateSettings', () => {
  it('returns defaults for null', () => {
    const s = validateSettings(null);
    expect(s.music).toBe(true);
  });

  it('clamps volume', () => {
    const s = validateSettings({ ...DEFAULT_SETTINGS, volume: 5 });
    expect(s.volume).toBe(1);
  });

  it('valid graphics tier', () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, graphics: 'LOW' }).graphics).toBe('LOW');
  });

  it('invalid graphics falls back', () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, graphics: 'ULTRA' }).graphics).toBe('HIGH');
  });
});

describe('validateAchievements', () => {
  it('returns empty for null', () => {
    expect(validateAchievements(null)).toEqual({});
  });

  it('filters invalid entries', () => {
    const result = validateAchievements({
      good: { unlocked: true, date: 1000 },
      bad: 'not-an-object',
    });
    expect(result.good?.unlocked).toBe(true);
    expect(result.bad).toBeUndefined();
  });
});

describe('migrate', () => {
  it('returns defaults for null', () => {
    const save = migrate(null);
    expect(save.version).toBe(1);
  });

  it('passes valid v1 data through', () => {
    const def = defaultSaveData();
    const save = migrate(def);
    expect(save.stats.highScore).toBe(0);
  });

  it('handles future version by falling back', () => {
    const save = migrate({ version: 999 });
    // Should fall back to defaults since no migration exists
    expect(save.version).toBe(1);
  });
});
