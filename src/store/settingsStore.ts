/**
 * Zustand store for user settings. Hydrated from localStorage.
 * Mutations persist immediately.
 */
import { create } from 'zustand';
import type { Settings, SaveData } from '@/types';
import { loadSave, updateSettings } from '@/storage/saveManager';

export interface SettingsStore {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
  /** Full save snapshot (for screens that need stats/cosmetics too). */
  save: SaveData;
  refreshSave: () => void;
}

const cloneSave = (s: SaveData): SaveData => ({
  ...s,
  stats: { ...s.stats },
  achievements: Object.fromEntries(
    Object.entries(s.achievements).map(([k, v]) => [k, { ...v }]),
  ),
  cosmetics: {
    owned: [...s.cosmetics.owned],
    equipped: { ...s.cosmetics.equipped },
  },
  daily: Object.fromEntries(
    Object.entries(s.daily).map(([k, v]) => [k, { ...v }]),
  ),
  settings: { ...s.settings },
});

export const useSettingsStore = create<SettingsStore>((set) => {
  const save = loadSave();
  const initialCloned = cloneSave(save);
  return {
    settings: initialCloned.settings,
    save: initialCloned,

    setSettings: (patch) => {
      const updated = updateSettings(patch);
      const cloned = cloneSave(updated);
      set({
        settings: cloned.settings,
        save: cloned,
      });
    },

    refreshSave: () => {
      const s = loadSave();
      const cloned = cloneSave(s);
      set({
        save: cloned,
        settings: cloned.settings,
      });
    },
  };
});
