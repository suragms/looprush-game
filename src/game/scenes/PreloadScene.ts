import Phaser from 'phaser';
import { SCENES, COLORS, TEX } from '@/game/config/constants';

/**
 * PreloadScene — generates all game textures procedurally.
 * No external assets to load; everything is neon vector graphics.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.preload });
  }

  create(): void {
    this.generateTextures();
    this.scene.start(SCENES.game);
  }

  private generateTextures(): void {
    const g = this.make.graphics({ add: false } as any);

    // --- Player orb (glowing circle) ---
    this.drawOrb(g, TEX.orb, 20, COLORS.orb, COLORS.orbGlow, 8);

    // --- Energy pickup ---
    this.drawOrb(g, TEX.energy, 14, COLORS.energy, 0x88ff66, 6);

    // --- Gold energy pickup ---
    this.drawOrb(g, TEX.energyGold, 16, COLORS.energyGold, 0xfff066, 7);

    // --- Basic Chaser ---
    this.drawPolygon(g, TEX.chaser, 18, COLORS.chaser, 6);

    // --- Bouncer ---
    this.drawSquare(g, TEX.bouncer, 16, COLORS.bouncer, 4);

    // --- Spinner center ---
    this.drawOrb(g, TEX.spinner, 12, COLORS.spinner, 0xc388f0, 5);

    // --- Spinner arm (elongated rectangle) ---
    this.drawArm(g, TEX.spinnerArm, 40, 8, COLORS.spinner);

    // --- Particle (small circle) ---
    this.drawOrb(g, TEX.particle, 4, COLORS.white, COLORS.orb, 2);

    // --- Warning ring ---
    g.clear();
    g.lineStyle(2, COLORS.danger, 0.7);
    g.strokeCircle(30, 30, 28);
    g.generateTexture(TEX.warningRing, 60, 60);
    g.clear();

    // Power-up textures (Phase 2 — placeholder circles)
    this.drawOrb(g, TEX.powerShield, 14, 0x00d4ff, 0x66e8ff, 5);
    this.drawOrb(g, TEX.powerMagnet, 14, 0xff66cc, 0xff99dd, 5);
    this.drawOrb(g, TEX.powerSlow, 14, 0x66ccff, 0x99ddff, 5);
    this.drawOrb(g, TEX.powerGhost, 14, 0xcc99ff, 0xddbbff, 5);
    this.drawOrb(g, TEX.powerScore, 14, COLORS.energyGold, 0xfff066, 5);
    this.drawOrb(g, TEX.powerBlast, 14, COLORS.danger, 0xff7799, 5);

    g.destroy();
  }

  /** Draw a glowing circle with an outer glow layer. */
  private drawOrb(
    g: Phaser.GameObjects.Graphics,
    key: string,
    radius: number,
    color: number,
    glow: number,
    glowRadius: number,
  ): void {
    const size = (radius + glowRadius) * 2 + 4;
    const cx = size / 2;
    g.clear();
    // Outer glow
    g.fillStyle(glow, 0.25);
    g.fillCircle(cx, cx, radius + glowRadius);
    // Inner glow
    g.fillStyle(glow, 0.4);
    g.fillCircle(cx, cx, radius + 3);
    // Core
    g.fillStyle(color, 1);
    g.fillCircle(cx, cx, radius);
    g.generateTexture(key, size, size);
    g.clear();
  }

  /** Draw a glowing hexagon. */
  private drawPolygon(
    g: Phaser.GameObjects.Graphics,
    key: string,
    radius: number,
    color: number,
    glowRadius: number,
    sides: number = 6,
  ): void {
    const size = (radius + glowRadius) * 2 + 4;
    const cx = size / 2;
    g.clear();
    // Glow
    g.fillStyle(color, 0.2);
    this.drawRegularPolygon(g, cx, cx, radius + glowRadius, sides);
    g.fillPath();
    // Core
    g.fillStyle(color, 1);
    this.drawRegularPolygon(g, cx, cx, radius, sides);
    g.fillPath();
    g.generateTexture(key, size, size);
    g.clear();
  }

  /** Draw a glowing square. */
  private drawSquare(
    g: Phaser.GameObjects.Graphics,
    key: string,
    halfSize: number,
    color: number,
    glowRadius: number,
  ): void {
    const size = (halfSize + glowRadius) * 2 + 4;
    const cx = size / 2;
    g.clear();
    // Glow
    g.fillStyle(color, 0.2);
    g.fillRoundedRect(cx - halfSize - glowRadius, cx - halfSize - glowRadius,
      (halfSize + glowRadius) * 2, (halfSize + glowRadius) * 2, 6);
    // Core
    g.fillStyle(color, 1);
    g.fillRoundedRect(cx - halfSize, cx - halfSize, halfSize * 2, halfSize * 2, 3);
    g.generateTexture(key, size, size);
    g.clear();
  }

  /** Draw an elongated arm shape. */
  private drawArm(
    g: Phaser.GameObjects.Graphics,
    key: string,
    width: number,
    height: number,
    color: number,
  ): void {
    const texW = width + 4;
    const texH = height + 4;
    g.clear();
    g.fillStyle(color, 0.8);
    g.fillRoundedRect(2, 2, width, height, height / 2);
    g.generateTexture(key, texW, texH);
    g.clear();
  }

  private drawRegularPolygon(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    radius: number,
    sides: number,
  ): void {
    g.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
  }
}
