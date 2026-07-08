/**
 * localStorage persistence layer.
 *
 * All reads/writes funnel through here. Writes only on meaningful
 * state changes — never per animation frame.
 */
import type { SaveData, PlayerStats, Settings, EquippedCosmetics } from '@/types';
import { STORAGE_KEY } from '@/game/config/constants';
import { defaultSaveData } from './defaults';
import { migrate } from './migration';

let _cache: SaveData | null = null;

/** Parse JSON safely — return null on any failure. */
function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Load save data from localStorage, migrating & validating as needed. */
export function loadSave(): SaveData {
  if (_cache) return _cache;
  const raw = safeParse(localStorage.getItem(STORAGE_KEY));
  _cache = migrate(raw);
  persist(_cache);
  return _cache;
}

/** Get the cached save (or load if not yet loaded). */
export function getSave(): SaveData {
  return _cache ?? loadSave();
}

/** Update cached save and persist selectively. */
export function updateSave(
  patch: Partial<Pick<SaveData, 'stats' | 'achievements' | 'cosmetics' | 'daily' | 'settings'>>,
): SaveData {
  const save = getSave();
  if (patch.stats) Object.assign(save.stats, patch.stats);
  if (patch.achievements) Object.assign(save.achievements, patch.achievements);
  if (patch.cosmetics) {
    if (patch.cosmetics.owned) save.cosmetics.owned = patch.cosmetics.owned;
    if (patch.cosmetics.equipped) Object.assign(save.cosmetics.equipped, patch.cosmetics.equipped);
  }
  if (patch.daily) Object.assign(save.daily, patch.daily);
  if (patch.settings) Object.assign(save.settings, patch.settings);
  persist(save);
  return save;
}

/** Convenience: update a subset of stats. */
export function updateStats(patch: Partial<PlayerStats>): SaveData {
  return updateSave({ stats: patch as PlayerStats });
}

/** Convenience: update settings. */
export function updateSettings(patch: Partial<Settings>): SaveData {
  return updateSave({ settings: patch as Settings });
}

/** Convenience: unlock an achievement. */
export function unlockAchievement(id: string): SaveData {
  const save = getSave();
  save.achievements[id] = { unlocked: true, date: Date.now() };
  persist(save);
  return save;
}

/** Convenience: update equipped cosmetics. */
export function equipCosmetics(patch: Partial<EquippedCosmetics>): SaveData {
  const save = getSave();
  Object.assign(save.cosmetics.equipped, patch);
  persist(save);
  return save;
}

/** Convenience: add a cosmetic to owned set. */
export function addOwnedCosmetic(id: string): SaveData {
  const save = getSave();
  if (!save.cosmetics.owned.includes(id)) {
    save.cosmetics.owned.push(id);
  }
  persist(save);
  return save;
}

/** Convenience: mark a daily challenge as completed. */
export function completeDailyChallenge(dateKey: string, challengeId: string): SaveData {
  const save = getSave();
  if (!save.daily[dateKey]) save.daily[dateKey] = {};
  save.daily[dateKey][challengeId] = true;
  persist(save);
  return save;
}

/** Wipe save and reset to defaults. */
export function resetSave(): SaveData {
  const def = defaultSaveData();
  _cache = def;
  persist(def);
  return def;
}

/** Low-level: write to localStorage. */
function persist(save: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Quota exceeded — degrade silently; data lives in memory for this session.
    console.warn('localStorage write failed; save persists in memory only.');
  }
}
