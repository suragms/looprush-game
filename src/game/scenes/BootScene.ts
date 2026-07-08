import Phaser from 'phaser';
import { SCENES } from '@/game/config/constants';

/**
 * Boot scene — fast setup, then immediately transitions to Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.boot });
  }

  create(): void {
    this.scene.start(SCENES.preload);
  }
}
