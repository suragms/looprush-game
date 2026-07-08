import { BALANCE } from '@/game/config/balance';

export class DashSystem {
  private dashTimer = 0;
  private invulnTimer = 0;
  private cooldownTimer = 0;
  isDashing = false;
  isInvulnerable = false;
  dashAngle = 0;
  private moveAngle = 0;

  tryDash(moveX: number, moveY: number): boolean {
    if (this.cooldownTimer > 0 || this.isDashing) return false;

    // Dash in direction of movement, or facing if stationary
    if (Math.abs(moveX) > 0.01 || Math.abs(moveY) > 0.01) {
      this.dashAngle = Math.atan2(moveY, moveX);
      this.moveAngle = this.dashAngle;
    } else {
      this.dashAngle = this.moveAngle;
    }

    this.dashTimer = BALANCE.dash.duration;
    this.isDashing = true;
    this.cooldownTimer = BALANCE.dash.cooldown;
    return true;
  }

  update(deltaSec: number): void {
    if (this.isDashing) {
      this.dashTimer -= deltaSec;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.invulnTimer = BALANCE.dash.invulnAfter;
        this.isInvulnerable = true;
      }
    }

    if (this.isInvulnerable && !this.isDashing) {
      this.invulnTimer -= deltaSec;
      if (this.invulnTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= deltaSec;
      if (this.cooldownTimer < 0) this.cooldownTimer = 0;
    }
  }

  /** 0 = ready, 1 = just started cooling. */
  get cooldownPercent(): number {
    if (this.cooldownTimer <= 0) return 0;
    return this.cooldownTimer / BALANCE.dash.cooldown;
  }

  reset(): void {
    this.dashTimer = 0;
    this.invulnTimer = 0;
    this.cooldownTimer = 0;
    this.isDashing = false;
    this.isInvulnerable = false;
    this.dashAngle = 0;
    this.moveAngle = 0;
  }
}
