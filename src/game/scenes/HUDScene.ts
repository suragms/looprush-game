import Phaser from 'phaser';
import { SCENES } from '@/game/config/constants';

interface HUDData {
  score: number;
  combo: number;
  multiplier: number;
  level: number;
  survival: number;
  dashCooldown: number;
  dashReady: boolean;
  isDashing: boolean;
  isInvuln: boolean;
  activePowerup: string | null;
  powerupTime: number;
  hasShield: boolean;
  activeEvent: string | null;
  eventTime: number;
}

export class HUDScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private dashCircle!: Phaser.GameObjects.Graphics;
  private powerupText!: Phaser.GameObjects.Text;
  private powerupTimer!: Phaser.GameObjects.Graphics;
  private shieldIndicator?: Phaser.GameObjects.Text;
  private eventText?: Phaser.GameObjects.Text;
  private comboContainer!: Phaser.GameObjects.Container;
  private arenaW: number;
  private arenaH: number;

  constructor(arenaW: number, arenaH: number) {
    super({ key: SCENES.hud });
    this.arenaW = arenaW;
    this.arenaH = arenaH;
  }

  create(): void {
    const cx = this.arenaW / 2;
    const pad = 10;

    // Score — top center
    this.scoreText = this.add.text(cx, pad + 18, '0', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(50);

    // Level — below score
    this.levelText = this.add.text(cx, pad + 52, 'LEVEL 1', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
      color: '#ffe600',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(50);

    // Survival time — top left
    this.timeText = this.add.text(pad + 8, pad + 8, '0:00', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0, 0).setDepth(50);

    // Combo — below score, animated scale
    this.comboText = this.add.text(cx, pad + 78, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '26px',
      color: '#ff2bd6',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(50);

    this.comboContainer = this.add.container(cx, 0, [this.comboText]).setDepth(50);

    // Dash indicator — bottom left
    this.dashCircle = this.add.graphics().setDepth(50);
    this.add.text(pad + 50, this.arenaH - pad - 50, 'DASH', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      color: '#00f0ff',
    }).setOrigin(0.5, 0).setDepth(50);

    // Powerup indicator — top right
    this.powerupText = this.add.text(this.arenaW - pad - 8, pad + 8, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: '#00f0ff',
    }).setOrigin(1, 0).setDepth(50);
    this.powerupTimer = this.add.graphics().setDepth(50);

    // Shield indicator
    this.shieldIndicator = this.add.text(this.arenaW - pad - 8, pad + 28, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      color: '#00d4ff',
    }).setOrigin(1, 0).setDepth(50);

    // Event text
    this.eventText = this.add.text(cx, this.arenaH / 2 - 100, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '20px',
      color: '#ffe600',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(50).setAlpha(0);

    // Listen for GameScene updates
    const gameScene = this.scene.get(SCENES.game);
    gameScene.events.on('hud-update', this.onHUDUpdate, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameScene.events.off('hud-update', this.onHUDUpdate, this);
    });
  }

  private onHUDUpdate(data: HUDData): void {
    // Score
    this.scoreText.setText(data.score.toLocaleString());

    // Level
    this.levelText.setText('LEVEL ' + data.level);

    // Survival time
    const mins = Math.floor(data.survival / 60);
    const secs = Math.floor(data.survival % 60);
    this.timeText.setText(mins + ':' + String(secs).padStart(2, '0'));

    // Combo
    if (data.combo > 1) {
      this.comboText.setText('x' + data.multiplier);
      this.comboContainer.setVisible(true);
      // Scale pulse on tier change
      this.comboContainer.setScale(1 + Math.min(data.multiplier * 0.02, 0.3));
    } else {
      this.comboContainer.setVisible(false);
    }

    // Dash circle
    this.dashCircle.clear();
    const dcx = 10 + 40;
    const dcy = this.arenaH - 10 - 40;
    const r = 30;

    if (data.dashReady) {
      this.dashCircle.lineStyle(3, data.isInvuln ? 0xffe600 : 0x00f0ff, 1);
    } else {
      this.dashCircle.lineStyle(3, 0x333355, 0.6);
    }
    this.dashCircle.strokeCircle(dcx, dcy, r);

    // Cooldown arc (fills from 12 o'clock clockwise)
    if (data.dashCooldown > 0) {
      const remaining = 1 - data.dashCooldown;
      this.dashCircle.lineStyle(4, 0x00f0ff, 0.8);
      this.dashCircle.beginPath();
      this.dashCircle.arc(dcx, dcy, r, -Math.PI / 2, -Math.PI / 2 + remaining * Math.PI * 2, false);
      this.dashCircle.strokePath();
    }

    // Dashing flash
    if (data.isDashing) {
      this.dashCircle.fillStyle(0x00f0ff, 0.3);
      this.dashCircle.fillCircle(dcx, dcy, r);
    }

    // Powerup
    if (data.activePowerup) {
      this.powerupText.setText(data.activePowerup.toUpperCase());
      this.powerupText.setVisible(true);
      // Timer bar
      this.powerupTimer.clear();
      const barW = 100;
      const barH = 4;
      const bx = this.arenaW - 10 - barW - 8;
      const by = 28;
      this.powerupTimer.fillStyle(0x333355, 0.8);
      this.powerupTimer.fillRect(bx, by, barW, barH);
      const pct = Math.max(0, data.powerupTime / 10);
      this.powerupTimer.fillStyle(0x00f0ff, 0.9);
      this.powerupTimer.fillRect(bx, by, barW * pct, barH);
    } else {
      this.powerupText.setVisible(false);
      this.powerupTimer.clear();
    }

    // Shield
    if (this.shieldIndicator) {
      this.shieldIndicator.setText(data.hasShield ? '🛡 SHIELD' : '');
    }

    // Event text
    if (this.eventText) {
      if (data.activeEvent) {
        const label = data.activeEvent.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
        this.eventText.setText('⚡ ' + label);
        this.eventText.setAlpha(1);
      } else {
        this.eventText.setAlpha(0);
      }
    }
  }
}
