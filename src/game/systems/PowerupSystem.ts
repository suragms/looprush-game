import type { PowerUpKind } from '@/types';

interface ActivePowerUp {
  kind: PowerUpKind;
  remaining: number; // seconds left; -1 = shield (one-use)
}

const POWERUP_DURATIONS: Record<PowerUpKind, number> = {
  shield: -1,
  magnet: 8,
  slowTime: 6,
  ghostMode: 5,
  scoreBoost: 10,
  energyBlast: -1, // instant
};

export class PowerupSystem {
  private active: ActivePowerUp[] = [];

  collect(kind: PowerUpKind): boolean {
    // Energy blast is instant — no duration
    if (kind === 'energyBlast') return true;

    // Shield stacks as single use, others refresh duration
    const existing = this.active.find((p) => p.kind === kind);
    if (existing) {
      existing.remaining = POWERUP_DURATIONS[kind]!;
      return true;
    }

    this.active.push({ kind, remaining: POWERUP_DURATIONS[kind]! });
    return true;
  }

  update(deltaSec: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.active[i]!.remaining < 0) continue; // one-use items
      this.active[i]!.remaining -= deltaSec;
      if (this.active[i]!.remaining <= 0) {
        this.active.splice(i, 1);
      }
    }
  }

  hasShield(): boolean {
    return this.active.some((p) => p.kind === 'shield');
  }

  consumeShield(): boolean {
    const idx = this.active.findIndex((p) => p.kind === 'shield');
    if (idx !== -1) {
      this.active.splice(idx, 1);
      return true;
    }
    return false;
  }

  isGhostMode(): boolean {
    return this.active.some((p) => p.kind === 'ghostMode');
  }

  getScoreMultiplier(): number {
    return this.active.some((p) => p.kind === 'scoreBoost') ? 2 : 1;
  }

  getSlowFactor(): number {
    return this.active.some((p) => p.kind === 'slowTime') ? 0.5 : 1;
  }

  hasMagnet(): boolean {
    return this.active.some((p) => p.kind === 'magnet');
  }

  /** Get remaining time for a power-up kind, or 0 if not active. */
  getRemaining(kind: PowerUpKind): number {
    const p = this.active.find((a) => a.kind === kind);
    return p ? Math.max(0, p.remaining) : 0;
  }

  getActiveKind(): PowerUpKind | null {
    if (this.active.length === 0) return null;
    return this.active[0]!.kind;
  }

  reset(): void {
    this.active.length = 0;
  }
}
