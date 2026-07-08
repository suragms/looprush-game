import {
  levelForTime,
  obstacleSpeedForLevel,
  spawnIntervalForLevel,
  obstacleSpeedComboMultiplier,
  comboTierIndex,
} from '@/game/config/balance';

export class DifficultySystem {
  private survivalTime = 0;
  private currentLevel = 1;
  justLeveledUp = false;
  private combo = 0;

  update(deltaSec: number, combo: number): void {
    this.combo = combo;
    const prev = this.currentLevel;
    this.survivalTime += deltaSec;
    this.currentLevel = levelForTime(this.survivalTime);
    this.justLeveledUp = this.currentLevel > prev;
  }

  getLevel(): number {
    return this.currentLevel;
  }

  getTime(): number {
    return this.survivalTime;
  }

  getObstacleSpeed(): number {
    return obstacleSpeedForLevel(this.currentLevel);
  }

  getSpawnInterval(): number {
    return spawnIntervalForLevel(this.currentLevel);
  }

  getEffectiveObstacleSpeed(): number {
    const base = this.getObstacleSpeed();
    return base * obstacleSpeedComboMultiplier(this.combo);
  }

  reset(): void {
    this.survivalTime = 0;
    this.currentLevel = 1;
    this.justLeveledUp = false;
    this.combo = 0;
  }
}
