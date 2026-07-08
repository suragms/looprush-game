/**
 * Zustand store for game-wide state: screen routing, last run result, toasts.
 * Hydrated from localStorage on app boot.
 */
import { create } from 'zustand';
import type { Screen, RunResult, ToastMessage } from '@/types';
import { loadSave, updateStats } from '@/storage/saveManager';

let _toastId = 0;

export interface GameStore {
  /** Current app screen. */
  screen: Screen;
  /** Result from the most recent completed run. */
  lastResult: RunResult | null;
  /** Active toast queue. */
  toasts: ToastMessage[];
  /** Player's high score (read from save). */
  highScore: number;

  /** Navigate to a screen. */
  setScreen: (s: Screen) => void;
  /** Called by Phaser GameScene on death. */
  onGameOver: (result: RunResult) => void;
  /** Push a toast notification. */
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  /** Remove a toast by id. */
  removeToast: (id: number) => void;
  /** Refresh high score from save (e.g. after a run). */
  refreshHighScore: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  const save = loadSave();
  return {
    screen: 'home',
    lastResult: null,
    toasts: [],
    highScore: save.stats.highScore,

    setScreen: (s) => set({ screen: s }),

    onGameOver: (result) => {
      const save = updateStats({
        gamesPlayed: (get().highScore !== undefined ? loadSave().stats.gamesPlayed : 0) + 1,
        highScore: Math.max(loadSave().stats.highScore, result.score),
        totalSurvivalSec: loadSave().stats.totalSurvivalSec + result.survivalSec,
        highestCombo: Math.max(loadSave().stats.highestCombo, result.highestCombo),
        maxLevel: Math.max(loadSave().stats.maxLevel, result.level),
        totalEnergy: loadSave().stats.totalEnergy + result.energy,
        nearMisses: loadSave().stats.nearMisses + result.nearMisses,
      });
      set({
        lastResult: { ...result, newHighScore: result.score >= save.stats.highScore && result.score > 0 },
        screen: 'result',
        highScore: save.stats.highScore,
      });
    },

    pushToast: (toast) => {
      const id = ++_toastId;
      set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
      setTimeout(() => get().removeToast(id), 3500);
    },

    removeToast: (id) =>
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    refreshHighScore: () =>
      set({ highScore: loadSave().stats.highScore }),
  };
});
