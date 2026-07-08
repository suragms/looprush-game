/**
 * Neon visual theme tokens (mirrors Tailwind palette for JS-side rendering).
 */

export interface OrbCosmetic {
  id: string;
  name: string;
  color: number;
  glow: number;
}

export const ORB_COSMETICS: OrbCosmetic[] = [
  { id: 'orb_cyan', name: 'Cyan', color: 0x00f0ff, glow: 0x66f7ff },
  { id: 'orb_magenta', name: 'Magenta', color: 0xff2bd6, glow: 0xff7be6 },
  { id: 'orb_green', name: 'Plasma', color: 0x39ff14, glow: 0x8cff66 },
  { id: 'orb_yellow', name: 'Solar', color: 0xffe600, glow: 0xfff066 },
  { id: 'orb_purple', name: 'Void', color: 0x9d4edd, glow: 0xc388f0 },
  { id: 'orb_orange', name: 'Ember', color: 0xff6b35, glow: 0xffa570 },
];

export interface ThemeCosmetic {
  id: string;
  name: string;
  bg: number;
  border: number;
}

export const THEME_COSMETICS: ThemeCosmetic[] = [
  { id: 'theme_void', name: 'Void', bg: 0x07070f, border: 0x2a2a44 },
  { id: 'theme_abyss', name: 'Abyss', bg: 0x04121a, border: 0x1b4a5e },
  { id: 'theme_rose', name: 'Rose', bg: 0x140a12, border: 0x5e1b3a },
];

export const TRAIL_COSMETICS = [
  { id: 'trail_default', name: 'Default' },
  { id: 'trail_comet', name: 'Comet' },
  { id: 'trail_spark', name: 'Spark' },
];

export const DASH_COSMETICS = [
  { id: 'dash_default', name: 'Default' },
  { id: 'dash_burst', name: 'Burst' },
  { id: 'dash_shock', name: 'Shock' },
];

export function orbColor(id: string): OrbCosmetic {
  return ORB_COSMETICS.find((o) => o.id === id) ?? ORB_COSMETICS[0]!;
}

export function themeColor(id: string): ThemeCosmetic {
  return THEME_COSMETICS.find((t) => t.id === id) ?? THEME_COSMETICS[0]!;
}

/** All cosmetic ids granted at start (always owned). */
export const DEFAULT_OWNED_COSMETICS = [
  'orb_cyan',
  'trail_default',
  'dash_default',
  'theme_void',
];

export const DEFAULT_EQUIPPED = {
  orb: 'orb_cyan',
  trail: 'trail_default',
  dash: 'dash_default',
  theme: 'theme_void',
};
