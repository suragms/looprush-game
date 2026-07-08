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

export const useSettingsStore = create<SettingsStore>((set) => {
  const save = loadSave();
  return {
    settings: save.settings,
    save,

    setSettings: (patch) => {
      const updated = updateSettings(patch);
      set({ settings: updated.settings });
    },

    refreshSave: () => {
      const s = loadSave();
      set({ save: s, settings: s.settings });
    },
  };
});
