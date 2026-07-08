/**
 * Loop Rush — shared type definitions.
 * Frontend-only; all persistence is in localStorage.
 */

/** Graphics quality tiers. */
export type GraphicsTier = 'LOW' | 'MEDIUM' | 'HIGH';

/** Player-facing app screens. The Phaser game runs while on 'game'. */
export type Screen =
  | 'home'
  | 'game'
  | 'result'
  | 'settings'
  | 'achievements'
  | 'stats'
  | 'customize'
  | 'daily';

/** Obstacle archetype identifiers. */
export type ObstacleKind =
  | 'basicChaser'
  | 'speedChaser'
  | 'bouncer'
  | 'spinner'
  | 'laser'
  | 'meteor'
  | 'splitter'
  | 'hunter';

/** Power-up identifiers. */
export type PowerUpKind =
  | 'shield'
  | 'magnet'
  | 'slowTime'
  | 'ghostMode'
  | 'scoreBoost'
  | 'energyBlast';

/** Random event identifiers. */
export type EventKind =
  | 'meteorRain'
  | 'blackout'
  | 'energyStorm'
  | 'speedSurge'
  | 'shrinkZone'
  | 'gravityShift'
  | 'laserGrid'
  | 'goldRush';

/** Cosmetic slot identifiers. */
export type CosmeticSlot = 'orb' | 'trail' | 'dash' | 'theme';

/** Persistent statistics tracked across all sessions. */
export interface PlayerStats {
  highScore: number;
  gamesPlayed: number;
  totalSurvivalSec: number;
  highestCombo: number;
  maxLevel: number;
  totalEnergy: number;
  nearMisses: number;
  powerupsCollected: number;
  dashDodges: number;
}

/** A single achievement entry. */
export interface AchievementRecord {
  unlocked: boolean;
  /** Epoch ms when unlocked (0 if locked). */
  date: number;
}

/** Equipped cosmetics per slot. */
export interface EquippedCosmetics {
  orb: string;
  trail: string;
  dash: string;
  theme: string;
}

/** User preferences, persisted independently of progress. */
export interface Settings {
  music: boolean;
  sfx: boolean;
  volume: number; // 0..1
  screenShake: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  graphics: GraphicsTier;
}

/** Result of a single completed run, passed to the Result screen. */
export interface RunResult {
  score: number;
  survivalSec: number;
  highestCombo: number;
  energy: number;
  nearMisses: number;
  level: number;
  newHighScore: boolean;
}

/** Top-level save object stored under the versioned storage key. */
export interface SaveData {
  version: number;
  stats: PlayerStats;
  achievements: Record<string, AchievementRecord>;
  cosmetics: { owned: string[]; equipped: EquippedCosmetics };
  daily: Record<string, Record<string, boolean>>;
  settings: Settings;
}

/** Daily challenge definition, generated deterministically from the date. */
export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  metric: DailyMetric;
  target: number;
}

/** Metrics a daily challenge can track. */
export type DailyMetric =
  | 'survivalSec'
  | 'highestCombo'
  | 'energy'
  | 'nearMisses'
  | 'level';

/** Identifies a toast notification (achievements / events). */
export interface ToastMessage {
  id: number;
  title: string;
  body?: string;
  kind: 'achievement' | 'event' | 'info';
}
