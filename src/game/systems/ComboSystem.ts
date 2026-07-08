import { BALANCE, comboMultiplier, comboTierIndex } from '@/game/config/balance';

export class ComboSystem {
  combo = 0;
  private decayTimer = 0;

  /** Called when the player collects an energy orb. */
  collectEnergy(currentCombo: number): number {
    this.combo = currentCombo + 1;
    this.decayTimer = BALANCE.combo.decayTime;
    return this.combo;
  }

  /** Call every frame with elapsed seconds. Decays combo if timer expires. */
  update(deltaSec: number): void {
    if (this.combo <= 0) return;
    this.decayTimer -= deltaSec;
    if (this.decayTimer <= 0) {
      this.combo = 0;
      this.decayTimer = 0;
    }
  }

  reset(): void {
    this.combo = 0;
    this.decayTimer = 0;
  }

  getMultiplier(): number {
    return comboMultiplier(this.combo);
  }

  getTierIndex(): number {
    return comboTierIndex(this.combo);
  }
}
