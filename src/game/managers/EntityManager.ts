import Phaser from 'phaser';
import type { ObstacleKind } from '@/types';
import { TEX, COLORS } from '@/game/config/constants';
import { angleTo, randRange } from '@/game/utils/math';
import type { PowerupSystem } from '@/game/systems/PowerupSystem';

const OBSTACLE_TEX: Record<ObstacleKind, string> = {
  basicChaser: TEX.chaser,
  speedChaser: TEX.chaser,
  bouncer: TEX.bouncer,
  spinner: TEX.spinner,
  laser: TEX.warningRing,
  meteor: TEX.warningRing,
  splitter: TEX.chaser,
  hunter: TEX.chaser,
};

const OBSTACLE_RADIUS: Record<ObstacleKind, number> = {
  basicChaser: 16,
  speedChaser: 14,
  bouncer: 14,
  spinner: 24,
  laser: 20,
  meteor: 18,
  splitter: 18,
  hunter: 15,
};

const OBSTACLE_COLOR: Partial<Record<ObstacleKind, number>> = {
  speedChaser: 0xff6b9d,
  splitter: 0xff8800,
  hunter: 0x00ff88,
  laser: COLORS.danger,
  meteor: COLORS.danger,
};

interface EntityData {
  uuid: string;
  kind: ObstacleKind;
  radius: number;
  speed: number;
  vx: number;
  vy: number;
  turningSpeed: number;
  lifeTimer: number;
  spinnerAngle: number;
  nearMissCooldown: number;
  hitRadius: number;
}

let _uuid = 0;
function nextUuid(): string {
  return `e_${++_uuid}`;
}

export class EntityManager {
  private scene: Phaser.Scene;
  private energyGroup: Phaser.GameObjects.Group;
  private obstacleGroup: Phaser.GameObjects.Group;
  private powerupGroup: Phaser.GameObjects.Group;
  private arenaW: number;
  private arenaH: number;
  private borderPad = 30;

  constructor(scene: Phaser.Scene, arenaW: number, arenaH: number) {
    this.scene = scene;
    this.arenaW = arenaW;
    this.arenaH = arenaH;
    this.energyGroup = scene.add.group({ runChildUpdate: false });
    this.obstacleGroup = scene.add.group({ runChildUpdate: false });
    this.powerupGroup = scene.add.group({ runChildUpdate: false });
  }

  spawnEnergy(x?: number, y?: number): Phaser.GameObjects.Image {
    const px = x ?? randRange(this.borderPad + 20, this.arenaW - this.borderPad - 20);
    const py = y ?? randRange(this.borderPad + 20, this.arenaH - this.borderPad - 20);
    const obj = this.scene.add.image(px, py, TEX.energy);
    obj.setScale(1);
    obj.setData('isEnergy', true);
    obj.setData('radius', 12);
    this.energyGroup.add(obj);
    return obj;
  }

  spawnGoldEnergy(x?: number, y?: number): Phaser.GameObjects.Image {
    const px = x ?? randRange(this.borderPad + 20, this.arenaW - this.borderPad - 20);
    const py = y ?? randRange(this.borderPad + 20, this.arenaH - this.borderPad - 20);
    const obj = this.scene.add.image(px, py, TEX.energyGold);
    obj.setData('isEnergy', true);
    obj.setData('isGold', true);
    obj.setData('radius', 14);
    this.energyGroup.add(obj);
    return obj;
  }

  spawnObstacle(
    kind: ObstacleKind,
    playerX: number,
    playerY: number,
    speed: number,
  ): Phaser.GameObjects.Image {
    // Spawn at arena edge
    const { x, y } = this.spawnAtEdge();
    const tex = OBSTACLE_TEX[kind]!;
    const radius = OBSTACLE_RADIUS[kind]!;
    const obj = this.scene.add.image(x, y, tex);
    const colorOverride = OBSTACLE_COLOR[kind];
    if (colorOverride) obj.setTint(colorOverride);

    // Calculate initial velocity: generally toward player with some randomness
    const angle = angleTo(x, y, playerX, playerY) + randRange(-0.5, 0.5);

    // Turning speed: chasers are slow turners, bouncers bounce
    let turnSpeed = 0.03;
    if (kind === 'speedChaser') turnSpeed = 0.015;
    else if (kind === 'hunter') turnSpeed = 0.06;
    else if (kind === 'bouncer') turnSpeed = 0; // bouncers don't turn

    obj.setData('entityData', {
      uuid: nextUuid(),
      kind,
      radius,
      speed: kind === 'speedChaser' ? speed * 1.6 : speed,
      vx: Math.cos(angle) * (kind === 'bouncer' ? speed : speed * 0.5),
      vy: Math.sin(angle) * (kind === 'bouncer' ? speed : speed * 0.5),
      turningSpeed: turnSpeed,
      lifeTimer: kind === 'laser' ? 2.5 : kind === 'meteor' ? 3 : 0,
      spinnerAngle: 0,
      nearMissCooldown: 0,
      hitRadius: radius,
    } satisfies EntityData);

    this.obstacleGroup.add(obj);
    return obj;
  }

  spawnPowerup(
    kind: string,
    texKey: string,
  ): Phaser.GameObjects.Image {
    const x = randRange(this.borderPad + 40, this.arenaW - this.borderPad - 40);
    const y = randRange(this.borderPad + 40, this.arenaH - this.borderPad - 40);
    const obj = this.scene.add.image(x, y, texKey);
    obj.setData('isPowerup', true);
    obj.setData('kind', kind);
    obj.setData('radius', 14);
    this.powerupGroup.add(obj);
    return obj;
  }

  /** Update all obstacles. Returns count of active obstacles. */
  updateObstacles(
    deltaSec: number,
    playerX: number,
    playerY: number,
    slowFactor: number,
    _powerupSys: PowerupSystem,
  ): Phaser.GameObjects.Image[] {
    const active: Phaser.GameObjects.Image[] = [];
    this.obstacleGroup.getChildren().forEach((child) => {
      const obj = child as Phaser.GameObjects.Image;
      const data = obj.getData('entityData') as EntityData | undefined;
      if (!data || !obj.active) return;

      const dt = deltaSec * slowFactor;
      const kind = data.kind;

      if (kind === 'basicChaser' || kind === 'speedChaser' || kind === 'hunter') {
        // Move toward player with turning
        const targetAngle = angleTo(obj.x, obj.y, playerX, playerY);
        const currentAngle = Math.atan2(data.vy, data.vx);
        const newAngle = this.turnToward(currentAngle, targetAngle, data.turningSpeed);
        const currentSpeed = Math.sqrt(data.vx * data.vx + data.vy * data.vy);
        // Accelerate toward max speed
        const accelSpeed = Math.min(currentSpeed + dt * data.speed * 0.8, data.speed);
        data.vx = Math.cos(newAngle) * accelSpeed;
        data.vy = Math.sin(newAngle) * accelSpeed;
      }

      if (kind === 'bouncer') {
        // Bounce off walls
        if (obj.x <= this.borderPad + data.radius || obj.x >= this.arenaW - this.borderPad - data.radius) {
          data.vx = -data.vx;
        }
        if (obj.y <= this.borderPad + data.radius || obj.y >= this.arenaH - this.borderPad - data.radius) {
          data.vy = -data.vy;
        }
        // Clamp to bounds
        obj.x = Phaser.Math.Clamp(obj.x, this.borderPad + data.radius, this.arenaW - this.borderPad - data.radius);
        obj.y = Phaser.Math.Clamp(obj.y, this.borderPad + data.radius, this.arenaH - this.borderPad - data.radius);
      }

      if (kind === 'spinner') {
        data.spinnerAngle += dt * 3;
        obj.rotation = data.spinnerAngle;
        // Spinners move slowly toward player
        const targetAngle = angleTo(obj.x, obj.y, playerX, playerY);
        const currentAngle = Math.atan2(data.vy, data.vx);
        const newAngle = this.turnToward(currentAngle, targetAngle, 0.02);
        data.vx = Math.cos(newAngle) * data.speed * 0.4;
        data.vy = Math.sin(newAngle) * data.speed * 0.4;
      }

      // Apply velocity
      obj.x += data.vx * dt;
      obj.y += data.vy * dt;

      // Keep chasers/hunters in bounds (wrap or bounce gently)
      if (kind !== 'bouncer') {
        if (obj.x < this.borderPad) obj.x = this.borderPad;
        if (obj.x > this.arenaW - this.borderPad) obj.x = this.arenaW - this.borderPad;
        if (obj.y < this.borderPad) obj.y = this.borderPad;
        if (obj.y > this.arenaH - this.borderPad) obj.y = this.arenaH - this.borderPad;
      }

      // Decay near-miss cooldown
      if (data.nearMissCooldown > 0) {
        data.nearMissCooldown -= deltaSec;
      }

      active.push(obj);
    });

    return active;
  }

  /** Animate energy items (gentle pulse). */
  updateEnergy(_deltaSec: number): void {
    // Energy items are static but could have animations
  }

  /** Remove a specific entity. */
  destroyEntity(obj: Phaser.GameObjects.Image): void {
    this.energyGroup.remove(obj, true, true);
    this.obstacleGroup.remove(obj, true, true);
    this.powerupGroup.remove(obj, true, true);
    obj.destroy();
  }

  /** Get all active energy items. */
  getEnergyItems(): Phaser.GameObjects.Image[] {
    return this.energyGroup.getChildren() as Phaser.GameObjects.Image[];
  }

  /** Get all active obstacles. */
  getObstacles(): Phaser.GameObjects.Image[] {
    return this.obstacleGroup.getChildren() as Phaser.GameObjects.Image[];
  }

  /** Get all active powerups. */
  getPowerups(): Phaser.GameObjects.Image[] {
    return this.powerupGroup.getChildren() as Phaser.GameObjects.Image[];
  }

  /** Destroy everything. */
  releaseAll(): void {
    this.energyGroup.clear(true, true);
    this.obstacleGroup.clear(true, true);
    this.powerupGroup.clear(true, true);
  }

  private spawnAtEdge(): { x: number; y: number } {
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    switch (side) {
      case 0: // top
        x = randRange(this.borderPad, this.arenaW - this.borderPad);
        y = this.borderPad;
        break;
      case 1: // right
        x = this.arenaW - this.borderPad;
        y = randRange(this.borderPad, this.arenaH - this.borderPad);
        break;
      case 2: // bottom
        x = randRange(this.borderPad, this.arenaW - this.borderPad);
        y = this.arenaH - this.borderPad;
        break;
      default: // left
        x = this.borderPad;
        y = randRange(this.borderPad, this.arenaH - this.borderPad);
        break;
    }
    return { x, y };
  }

  private turnToward(current: number, target: number, maxDelta: number): number {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) <= maxDelta) return target;
    return current + Math.sign(diff) * maxDelta;
  }
}

export type { EntityData };
