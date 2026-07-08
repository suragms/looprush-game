import { BALANCE } from '@/game/config/balance';
import { dist } from '@/game/utils/math';

export class NearMissSystem {
  private cooldowns = new Map<string, number>();
  private totalNearMisses = 0;

  /**
   * Check if a near miss occurred this frame for a specific obstacle.
   * Returns true if a new near miss was detected.
   */
  check(
    playerX: number,
    playerY: number,
    obstacleX: number,
    obstacleY: number,
    obstacleRadius: number,
    uuid: string,
    deltaSec: number,
  ): boolean {
    const d = dist(playerX, playerY, obstacleX, obstacleY);
    const nearDist = BALANCE.nearMiss.distance + obstacleRadius;

    if (d < nearDist && d > obstacleRadius) {
      const cd = this.cooldowns.get(uuid) ?? 0;
      if (cd <= 0) {
        this.cooldowns.set(uuid, BALANCE.nearMiss.perObstacleCooldown);
        this.totalNearMisses++;
        return true;
      }
    }

    // Decay cooldowns
    if (deltaSec > 0) {
      this.cooldowns.set(uuid, (this.cooldowns.get(uuid) ?? 0) - deltaSec);
    }
    return false;
  }

  getTotal(): number {
    return this.totalNearMisses;
  }

  reset(): void {
    this.cooldowns.clear();
    this.totalNearMisses = 0;
  }
}
