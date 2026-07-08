/**
 * Save data validation & safe recovery.
 *
 * Strategy: validate field-by-field, coercing where safe and falling back
 * to defaults for anything malformed. Never throw on corruption — return a
 * clean SaveData so the app always boots.
 */
import type { AchievementRecord, SaveData, Settings } from '@/types';
import { defaultSaveData } from './defaults';
import { SAVE_VERSION } from '@/game/config/constants';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

const GRAPHICS = new Set(['LOW', 'MEDIUM', 'HIGH']);

/** Deeply validate + repair a Settings object. */
export function validateSettings(raw: unknown): Settings {
  const def = defaultSaveData().settings;
  if (!isObject(raw)) return def;
  return {
    music: asBool(raw.music, def.music),
    sfx: asBool(raw.sfx, def.sfx),
    volume: clamp(asNumber(raw.volume, def.volume), 0, 1),
    screenShake: asBool(raw.screenShake, def.screenShake),
    reducedMotion: asBool(raw.reducedMotion, def.reducedMotion),
    highContrast: asBool(raw.highContrast, def.highContrast),
    graphics: GRAPHICS.has(raw.graphics as string)
      ? (raw.graphics as Settings['graphics'])
      : def.graphics,
  };
}

/** Validate an achievements record object. */
export function validateAchievements(raw: unknown): Record<string, AchievementRecord> {
  if (!isObject(raw)) return {};
  const out: Record<string, AchievementRecord> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (isObject(val)) {
      out[key] = {
        unlocked: asBool(val.unlocked, false),
        date: asNumber(val.date, 0),
      };
    }
  }
  return out;
}

/**
 * Validate arbitrary data into a clean SaveData.
 * On any structural problem, fall back to defaults per-section.
 */
export function validateSaveData(raw: unknown): SaveData {
  const def = defaultSaveData();
  if (!isObject(raw)) return def;

  const statsRaw = isObject(raw.stats) ? raw.stats : {};
  const stats = {
    highScore: Math.max(0, Math.floor(asNumber(statsRaw.highScore, 0))),
    gamesPlayed: Math.max(0, Math.floor(asNumber(statsRaw.gamesPlayed, 0))),
    totalSurvivalSec: Math.max(0, asNumber(statsRaw.totalSurvivalSec, 0)),
    highestCombo: Math.max(0, Math.floor(asNumber(statsRaw.highestCombo, 0))),
    maxLevel: Math.max(1, Math.floor(asNumber(statsRaw.maxLevel, 1))),
    totalEnergy: Math.max(0, Math.floor(asNumber(statsRaw.totalEnergy, 0))),
    nearMisses: Math.max(0, Math.floor(asNumber(statsRaw.nearMisses, 0))),
    powerupsCollected: Math.max(0, Math.floor(asNumber(statsRaw.powerupsCollected, 0))),
    dashDodges: Math.max(0, Math.floor(asNumber(statsRaw.dashDodges, 0))),
  };

  const cosmeticsRaw = isObject(raw.cosmetics) ? raw.cosmetics : {};
  const ownedRaw = cosmeticsRaw.owned;
  const owned = Array.isArray(ownedRaw)
    ? ownedRaw.filter((x): x is string => typeof x === 'string')
    : def.cosmetics.owned;
  const equippedRaw = isObject(cosmeticsRaw.equipped) ? cosmeticsRaw.equipped : {};
  const defEq = def.cosmetics.equipped;
  const equipped = {
    orb: typeof equippedRaw.orb === 'string' ? equippedRaw.orb : defEq.orb,
    trail: typeof equippedRaw.trail === 'string' ? equippedRaw.trail : defEq.trail,
    dash: typeof equippedRaw.dash === 'string' ? equippedRaw.dash : defEq.dash,
    theme: typeof equippedRaw.theme === 'string' ? equippedRaw.theme : defEq.theme,
  };

  const dailyRaw = isObject(raw.daily) ? raw.daily : {};
  const daily: Record<string, Record<string, boolean>> = {};
  for (const [dateKey, val] of Object.entries(dailyRaw)) {
    if (isObject(val)) {
      const entry: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(val)) {
        entry[k] = asBool(v, false);
      }
      daily[dateKey] = entry;
    }
  }

  return {
    version: SAVE_VERSION,
    stats,
    achievements: validateAchievements(raw.achievements),
    cosmetics: { owned, equipped },
    daily,
    settings: validateSettings(raw.settings),
  };
}
