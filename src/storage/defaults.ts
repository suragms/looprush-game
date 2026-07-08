/**
 * Default save data. The single source of truth for a fresh save.
 * Imported by validate.ts (recovery) and saveManager.ts (bootstrap).
 */
import type { SaveData, Settings } from '@/types';
import { SAVE_VERSION } from '@/game/config/constants';
import { DEFAULT_EQUIPPED, DEFAULT_OWNED_COSMETICS } from '@/game/config/theme';

export const DEFAULT_SETTINGS: Settings = {
  music: true,
  sfx: true,
  volume: 0.7,
  screenShake: true,
  reducedMotion: false,
  highContrast: false,
  graphics: 'HIGH',
};

export function defaultSaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    stats: {
      highScore: 0,
      gamesPlayed: 0,
      totalSurvivalSec: 0,
      highestCombo: 0,
      maxLevel: 1,
      totalEnergy: 0,
      nearMisses: 0,
      powerupsCollected: 0,
      dashDodges: 0,
    },
    achievements: {},
    cosmetics: {
      owned: [...DEFAULT_OWNED_COSMETICS],
      equipped: { ...DEFAULT_EQUIPPED },
    },
    daily: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}
