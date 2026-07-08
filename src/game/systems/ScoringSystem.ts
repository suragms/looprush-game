import { energyPickupScore, survivalTickScore } from '@/game/config/balance';
import { BALANCE } from '@/game/config/balance';

export class ScoringSystem {
  private total = 0;

  addEnergyPickup(combo: number, isGold: boolean): void {
    this.total += energyPickupScore(combo, isGold);
  }

  addNearMiss(combo: number): void {
    this.total += Math.round(BALANCE.nearMiss.score * (combo > 0 ? combo : 1));
  }

  addSurvival(deltaSec: number, level: number, combo: number): void {
    this.total += survivalTickScore(deltaSec, level, combo);
  }

  getTotal(): number {
    return this.total;
  }

  reset(): void {
    this.total = 0;
  }
}
