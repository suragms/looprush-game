/**
 * Global gameplay + project constants.
 * Tuned for a fast, fair, mobile-friendly feel.
 */

/** Versioned localStorage key; bump to invalidate / migrate. */
export const STORAGE_KEY = 'loopRush_save_v1';

/** Current save schema version. */
export const SAVE_VERSION = 1;

/** Background + scene colours. */
export const COLORS = {
  bgDeep: 0x07070f,
  bgDark: 0x0a0a14,
  bgPanel: 0x12121f,
  arenaBorder: 0x2a2a44,
  orb: 0x00f0ff,
  orbGlow: 0x33f6ff,
  energy: 0x39ff14,
  energyGold: 0xffe600,
  chaser: 0xff2bd6,
  bouncer: 0xff6b35,
  spinner: 0x9d4edd,
  danger: 0xff3860,
  white: 0xffffff,
} as const;

/** Texture keys generated procedurally in PreloadScene. */
export const TEX = {
  orb: 'tex_orb',
  energy: 'tex_energy',
  energyGold: 'tex_energy_gold',
  chaser: 'tex_chaser',
  bouncer: 'tex_bouncer',
  spinner: 'tex_spinner',
  spinnerArm: 'tex_spinner_arm',
  particle: 'tex_particle',
  powerShield: 'tex_power_shield',
  powerMagnet: 'tex_power_magnet',
  powerSlow: 'tex_power_slow',
  powerGhost: 'tex_power_ghost',
  powerScore: 'tex_power_score',
  powerBlast: 'tex_power_blast',
  warningRing: 'tex_warning_ring',
} as const;

/** Scene keys. */
export const SCENES = {
  boot: 'BootScene',
  preload: 'PreloadScene',
  game: 'GameScene',
  hud: 'HUDScene',
} as const;

/** Phaser scaling + render config. */
export const GAME_CONFIG = {
  /** Logical arena size; the camera auto-fits the viewport. */
  ARENA_WIDTH: 720,
  ARENA_HEIGHT: 1280,
  physics: {
    default: 'arcade' as const,
    arcade: {
      // Custom collision handling — we disable built-in separation.
      customUpdate: true,
      debug: false,
    },
  },
};

/** Entity hard caps to protect low-end devices. */
export const ENTITY_CAPS = {
  obstacles: 26,
  energy: 40,
  particles: 180,
} as const;

/** Default logical DPR cap to limit overdraw on retina phones. */
export const MAX_DPR = 2;
