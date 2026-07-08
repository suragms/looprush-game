import Phaser from 'phaser';
import { SCENES, COLORS, TEX, GAME_CONFIG, ENTITY_CAPS } from '@/game/config/constants';
import { BALANCE, playerSpeedForCombo } from '@/game/config/balance';
import { orbColor, themeColor } from '@/game/config/theme';
import { loadSave, updateStats, unlockAchievement, completeDailyChallenge } from '@/storage/saveManager';
import { useGameStore } from '@/store/gameStore';
import type { ObstacleKind, PowerUpKind, RunResult, EventKind } from '@/types';
import { InputManager } from '@/game/managers/InputManager';
import { EntityManager } from '@/game/managers/EntityManager';
import { AudioManager } from '@/game/managers/AudioManager';
import { ComboSystem } from '@/game/systems/ComboSystem';
import { ScoringSystem } from '@/game/systems/ScoringSystem';
import { DifficultySystem } from '@/game/systems/DifficultySystem';
import { DashSystem } from '@/game/systems/DashSystem';
import { NearMissSystem } from '@/game/systems/NearMissSystem';
import { PowerupSystem } from '@/game/systems/PowerupSystem';
import { EventSystem } from '@/game/systems/EventSystem';
import { ACHIEVEMENTS } from '@/game/config/achievements';
import { generateDailyChallenges, todayKey, checkDailyChallenge } from '@/game/config/challenges';
import { checkUnlocks } from '@/game/config/cosmetics';
import { addOwnedCosmetic } from '@/storage/saveManager';
import { randPick, randRange } from '@/game/utils/math';

const POWERUP_TEX: Record<PowerUpKind, string> = {
  shield: TEX.powerShield,
  magnet: TEX.powerMagnet,
  slowTime: TEX.powerSlow,
  ghostMode: TEX.powerGhost,
  scoreBoost: TEX.powerScore,
  energyBlast: TEX.powerBlast,
};

// Obstacle unlock gating by level
const OBSTACLE_SCHEDULE: Array<{ level: number; kind: ObstacleKind }> = [
  { level: 1, kind: 'basicChaser' },
  { level: 1, kind: 'bouncer' },
  { level: 2, kind: 'spinner' },
  { level: 4, kind: 'speedChaser' },
  { level: 6, kind: 'hunter' },
  { level: 8, kind: 'splitter' },
  { level: 10, kind: 'laser' },
  { level: 12, kind: 'meteor' },
];

const POWERUP_KINDS: PowerUpKind[] = [
  'shield', 'magnet', 'slowTime', 'ghostMode', 'scoreBoost', 'energyBlast',
];

interface FloatingText {
  text: Phaser.GameObjects.Text;
  life: number;
  vy: number;
}

export class GameScene extends Phaser.Scene {
  private input2!: InputManager;
  private entities!: EntityManager;
  private comboSys = new ComboSystem();
  private scoreSys = new ScoringSystem();
  private difficultySys = new DifficultySystem();
  private dashSys = new DashSystem();
  private nearMissSys = new NearMissSystem();
  private powerupSys = new PowerupSystem();
  private eventSys = new EventSystem();

  private player!: Phaser.GameObjects.Image;
  private playerVx = 0;
  private playerVy = 0;
  private playerGlow!: Phaser.GameObjects.Image;
  private trail!: Phaser.GameObjects.Particles.ParticleEmitter;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  private arenaW = GAME_CONFIG.ARENA_WIDTH;
  private arenaH = GAME_CONFIG.ARENA_HEIGHT;
  private borderPad = 30;

  private spawnTimer = 0;
  private energyTimer = 0;
  private powerupTimer = 0;
  private isGameOver = false;
  private isPaused = false;
  private prevComboTier = 0;
  private dashDodgesThisRun = 0;
  private highestComboThisRun = 0;

  private floatingTexts: FloatingText[] = [];
  private pauseOverlay?: Phaser.GameObjects.Container;
  private settings = loadSave().settings;

  // event state
  private activeEvent: EventKind | null = null;
  private eventOverlay?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SCENES.game });
  }

  create(): void {
    const save = loadSave();
    this.settings = save.settings;

    // Camera + scaling: fit arena to viewport
    this.scaleToFit();
    this.cameras.main.setBackgroundColor(themeColor(save.cosmetics.equipped.theme).bg);

    // Background grid
    this.drawArena(save.cosmetics.equipped.theme);

    // Player
    const orb = orbColor(save.cosmetics.equipped.orb);
    this.player = this.add.image(this.arenaW / 2, this.arenaH / 2, TEX.orb);
    this.player.setTint(orb.color);
    this.playerGlow = this.add.image(this.arenaW / 2, this.arenaH / 2, TEX.orb);
    this.playerGlow.setTint(orb.glow);
    this.playerGlow.setAlpha(0.4);
    this.playerGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.playerGlow.setScale(1.4);

    // Particles
    this.particles = this.add.particles(this.player.x, this.player.y, TEX.particle, {
      speed: { min: 20, max: 80 },
      lifespan: 300,
      quantity: 0,
      scale: { start: 1, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      tint: orb.color,
      emitting: false,
    });

    // Trail (movement)
    this.trail = this.add.particles(this.player.x, this.player.y, TEX.particle, {
      speed: 0,
      lifespan: 250,
      quantity: 1,
      frequency: 30,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.5, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      tint: orb.color,
      emitting: false,
    });

    this.input2 = new InputManager(this);
    this.entities = new EntityManager(this, this.arenaW, this.arenaH);

    // Seed initial energy
    for (let i = 0; i < 8; i++) this.entities.spawnEnergy();

    // Reset systems
    this.comboSys.reset();
    this.scoreSys.reset();
    this.difficultySys.reset();
    this.dashSys.reset();
    this.nearMissSys.reset();
    this.powerupSys.reset();
    this.eventSys.reset();
    this.isGameOver = false;
    this.isPaused = false;
    this.spawnTimer = 1.5;
    this.energyTimer = 2;
    this.powerupTimer = 15;
    this.prevComboTier = 0;
    this.dashDodgesThisRun = 0;
    this.highestComboThisRun = 0;

    // Audio
    AudioManager.setVolume(this.settings.volume);
    AudioManager.setMusicEnabled(this.settings.music);
    AudioManager.setSfxEnabled(this.settings.sfx);
    if (this.settings.music) AudioManager.startMusic();

    // Pause overlay setup
    this.setupPauseOverlay();

    // HUD events
    this.events.emit('hud-start');
    this.updateHUD();

    // Lifecycle listeners
    this.setupLifecycle();
  }

  update(_time: number, deltaMs: number): void {
    if (this.isGameOver || this.isPaused) return;

    const deltaSec = Math.min(deltaMs / 1000, 0.05); // cap delta for stability

    this.input2.update();
    const input = this.input2.input;

    // Pause toggle
    if (input.pause) {
      this.togglePause();
      return;
    }

    // Difficulty + score ticking
    this.difficultySys.update(deltaSec, this.comboSys.combo);
    this.scoreSys.addSurvival(deltaSec, this.difficultySys.getLevel(), this.comboSys.combo);
    if (this.difficultySys.justLeveledUp) {
      AudioManager.playLevelUp();
      this.showFloatingText('LEVEL ' + this.difficultySys.getLevel(), this.player.x, this.player.y - 50, '#ffe600');
    }

    // Combo decay
    this.comboSys.update(deltaSec);
    if (this.comboSys.combo > this.highestComboThisRun) {
      this.highestComboThisRun = this.comboSys.combo;
    }

    // Combo tier-up sound
    const tier = this.comboSys.getTierIndex();
    if (tier > this.prevComboTier) {
      AudioManager.playComboUp(tier);
      this.showFloatingText('x' + this.comboSys.getMultiplier() + '!', this.player.x, this.player.y - 40, '#ff2bd6');
    }
    this.prevComboTier = tier;

    // Movement
    this.updatePlayer(deltaSec, input);

    // Dash
    this.dashSys.update(deltaSec);
    if (input.dash && this.dashSys.tryDash(input.moveX, input.moveY)) {
      AudioManager.playDash();
      this.particles.emitParticleAt(this.player.x, this.player.y, 20);
      if (this.settings.screenShake && !this.settings.reducedMotion) {
        this.cameras.main.shake(80, 0.004);
      }
    }

    // Apply dash velocity
    if (this.dashSys.isDashing) {
      this.playerVx = Math.cos(this.dashSys.dashAngle) * BALANCE.dash.speed;
      this.playerVy = Math.sin(this.dashSys.dashAngle) * BALANCE.dash.speed;
      this.trail.emitting = true;
    } else {
      this.trail.emitting = false;
    }

    // Powerups
    this.powerupSys.update(deltaSec);

    // Obstacles
    const slow = this.powerupSys.getSlowFactor();
    const obstacles = this.entities.updateObstacles(
      deltaSec,
      this.player.x,
      this.player.y,
      slow,
      this.powerupSys,
    );

    // Near-miss detection + collisions
    let dodgedThisFrame = false;
    for (const obs of obstacles) {
      const data = obs.getData('entityData');
      if (!data) continue;

      // Near miss check (only when not dashing/invulnerable)
      if (!this.dashSys.isDashing && !this.dashSys.isInvulnerable && !this.powerupSys.isGhostMode()) {
        const near = this.nearMissSys.check(
          this.player.x, this.player.y,
          obs.x, obs.y,
          data.radius,
          data.uuid,
          deltaSec,
        );
        if (near) {
          this.scoreSys.addNearMiss(this.comboSys.combo);
          AudioManager.playNearMiss();
          this.showFloatingText('NEAR MISS +100', this.player.x, this.player.y - 30, '#00f0ff');
        }
      }

      // Collision check
      const dx = this.player.x - obs.x;
      const dy = this.player.y - obs.y;
      const distSq = dx * dx + dy * dy;
      const hitDist = BALANCE.player.radius + data.radius;
      if (distSq < hitDist * hitDist) {
        if (this.dashSys.isDashing || this.dashSys.isInvulnerable) {
          // Dashed through — count dodge
          if (!dodgedThisFrame) {
            this.dashDodgesThisRun++;
            dodgedThisFrame = true;
          }
        } else if (this.powerupSys.isGhostMode()) {
          // pass through
        } else if (this.powerupSys.hasShield()) {
          this.powerupSys.consumeShield();
          this.entities.destroyEntity(obs);
          AudioManager.playPowerUp();
          this.particles.emitParticleAt(obs.x, obs.y, 12);
        } else {
          this.gameOver();
          return;
        }
      }
    }

    // Energy collisions
    for (const energy of this.entities.getEnergyItems()) {
      if (!energy.active) continue;
      const dx = this.player.x - energy.x;
      const dy = this.player.y - energy.y;
      const r = BALANCE.player.radius + (energy.getData('radius') ?? 12);
      if (dx * dx + dy * dy < r * r) {
        const isGold = energy.getData('isGold') === true;
        const prevCombo = this.comboSys.combo;
        const newCombo = this.comboSys.collectEnergy(prevCombo);
        this.scoreSys.addEnergyPickup(newCombo, isGold);
        this.energyCollectedThisRun++;
        AudioManager.playCollect();
        this.entities.destroyEntity(energy);
        this.particles.emitParticleAt(energy.x, energy.y, 8);
        if (isGold) {
          this.showFloatingText('+' + Math.round(80 * this.comboSys.getMultiplier()), energy.x, energy.y, '#ffe600');
        }
      }
    }

    // Magnet effect
    if (this.powerupSys.hasMagnet()) {
      const magnetRange = 180;
      for (const energy of this.entities.getEnergyItems()) {
        if (!energy.active) continue;
        const dx = this.player.x - energy.x;
        const dy = this.player.y - energy.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < magnetRange && d > 1) {
          energy.x += (dx / d) * 400 * deltaSec;
          energy.y += (dy / d) * 400 * deltaSec;
        }
      }
    }

    // Powerup collisions
    for (const pw of this.entities.getPowerups()) {
      if (!pw.active) continue;
      const dx = this.player.x - pw.x;
      const dy = this.player.y - pw.y;
      const r = BALANCE.player.radius + 16;
      if (dx * dx + dy * dy < r * r) {
        const kind = pw.getData('kind') as PowerUpKind;
        this.powerupSys.collect(kind);
        AudioManager.playPowerUp();
        this.entities.destroyEntity(pw);
        this.showFloatingText(kind.toUpperCase(), this.player.x, this.player.y - 40, '#00f0ff');
        if (kind === 'energyBlast') {
          // Destroy nearby obstacles
          for (const obs of this.entities.getObstacles()) {
            if (!obs.active) continue;
            const odx = this.player.x - obs.x;
            const ody = this.player.y - obs.y;
            if (odx * odx + ody * ody < 200 * 200) {
              this.particles.emitParticleAt(obs.x, obs.y, 10);
              this.entities.destroyEntity(obs);
            }
          }
        }
      }
    }

    // Spawning
    this.handleSpawning(deltaSec);

    // Events
    const newEvent = this.eventSys.update(deltaSec);
    if (newEvent) {
      this.triggerEvent(newEvent);
    }
    if (this.eventSys.getActiveEvent() === null && this.activeEvent) {
      this.endEvent();
    }

    // Floating texts
    this.updateFloatingTexts(deltaSec);

    // HUD update (no React re-render — direct text)
    this.updateHUD();
  }

  private updatePlayer(deltaSec: number, input: { moveX: number; moveY: number }): void {
    if (this.dashSys.isDashing) {
      // Velocity set by dash
    } else {
      const maxSpeed = playerSpeedForCombo(this.comboSys.combo);
      // Accelerate toward target velocity
      const targetVx = input.moveX * maxSpeed;
      const targetVy = input.moveY * maxSpeed;
      const accel = 2400 * deltaSec;
      this.playerVx = this.approach(this.playerVx, targetVx, accel);
      this.playerVy = this.approach(this.playerVy, targetVy, accel);
    }

    this.player.x += this.playerVx * deltaSec;
    this.player.y += this.playerVy * deltaSec;

    // Clamp to arena
    const r = BALANCE.player.radius;
    const minX = this.borderPad + r;
    const maxX = this.arenaW - this.borderPad - r;
    const minY = this.borderPad + r;
    const maxY = this.arenaH - this.borderPad - r;
    if (this.player.x < minX) { this.player.x = minX; this.playerVx = 0; }
    if (this.player.x > maxX) { this.player.x = maxX; this.playerVx = 0; }
    if (this.player.y < minY) { this.player.y = minY; this.playerVy = 0; }
    if (this.player.y > maxY) { this.player.y = maxY; this.playerVy = 0; }

    // Glow + particles follow player
    this.playerGlow.x = this.player.x;
    this.playerGlow.y = this.player.y;
    this.particles.setPosition(this.player.x, this.player.y);
    this.trail.setPosition(this.player.x, this.player.y);
  }

  private approach(current: number, target: number, maxDelta: number): number {
    if (current < target) return Math.min(current + maxDelta, target);
    if (current > target) return Math.max(current - maxDelta, target);
    return current;
  }

  private handleSpawning(deltaSec: number): void {
    // Obstacles
    this.spawnTimer -= deltaSec;
    if (this.spawnTimer <= 0 && this.entities.getObstacles().length < ENTITY_CAPS.obstacles) {
      const level = this.difficultySys.getLevel();
      const available = OBSTACLE_SCHEDULE.filter((o) => o.level <= level).map((o) => o.kind);
      const kind = randPick(available);
      const speed = this.difficultySys.getObstacleSpeed();
      this.entities.spawnObstacle(kind, this.player.x, this.player.y, speed);
      this.spawnTimer = this.difficultySys.getSpawnInterval();
    }

    // Energy
    this.energyTimer -= deltaSec;
    if (this.energyTimer <= 0 && this.entities.getEnergyItems().length < ENTITY_CAPS.energy) {
      this.entities.spawnEnergy();
      this.energyTimer = randRange(0.8, 1.8);
    }

    // Powerups
    this.powerupTimer -= deltaSec;
    if (this.powerupTimer <= 0 && this.entities.getPowerups().length < 2) {
      const kind = randPick(POWERUP_KINDS);
      this.entities.spawnPowerup(kind, POWERUP_TEX[kind]!);
      this.powerupTimer = randRange(18, 30);
    }
  }

  private triggerEvent(kind: EventKind): void {
    this.activeEvent = kind;
    AudioManager.playEvent();
    this.showFloatingText(kind.toUpperCase(), this.arenaW / 2, this.arenaH / 3, '#ffe600');
    useGameStore.getState().pushToast({
      title: 'EVENT: ' + kind.replace(/([A-Z])/g, ' $1').trim().toUpperCase(),
      kind: 'event',
    });

    switch (kind) {
      case 'blackout':
        this.eventOverlay = this.add.rectangle(this.arenaW / 2, this.arenaH / 2, this.arenaW, this.arenaH, 0x000000, 0.78);
        this.eventOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
        break;
      case 'energyStorm':
        for (let i = 0; i < 20; i++) this.entities.spawnEnergy();
        break;
      case 'goldRush':
        for (let i = 0; i < 6; i++) this.entities.spawnGoldEnergy();
        break;
      case 'speedSurge':
        // handled by event effect on obstacle speed
        break;
      default:
        break;
    }
  }

  private endEvent(): void {
    this.activeEvent = null;
    if (this.eventOverlay) {
      this.eventOverlay.destroy();
      this.eventOverlay = undefined;
    }
  }

  private drawArena(themeId: string): void {
    const theme = themeColor(themeId);
    const g = this.add.graphics();
    g.fillStyle(theme.bg, 1);
    g.fillRect(0, 0, this.arenaW, this.arenaH);

    // Grid lines
    const grid = 60;
    g.lineStyle(1, theme.border, 0.4);
    for (let x = this.borderPad; x <= this.arenaW - this.borderPad; x += grid) {
      g.lineBetween(x, this.borderPad, x, this.arenaH - this.borderPad);
    }
    for (let y = this.borderPad; y <= this.arenaH - this.borderPad; y += grid) {
      g.lineBetween(this.borderPad, y, this.arenaW - this.borderPad, y);
    }

    // Border
    g.lineStyle(3, COLORS.arenaBorder, 1);
    g.strokeRect(this.borderPad, this.borderPad, this.arenaW - this.borderPad * 2, this.arenaH - this.borderPad * 2);
    g.setScrollFactor(0);
  }

  private scaleToFit(): void {
    // Use FIT scale mode handled at game level; center camera
    this.cameras.main.setSize(this.arenaW, this.arenaH);
    this.cameras.main.centerOn(this.arenaW / 2, this.arenaH / 2);
  }

  private showFloatingText(text: string, x: number, y: number, color: string): void {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      color,
      fontStyle: 'bold',
    });
    t.setOrigin(0.5);
    t.setAlpha(1);
    this.floatingTexts.push({ text: t, life: 1.0, vy: -40 });
  }

  private updateFloatingTexts(deltaSec: number): void {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i]!;
      ft.life -= deltaSec;
      ft.text.y += ft.vy * deltaSec;
      ft.text.setAlpha(Math.max(0, ft.life));
      if (ft.life <= 0) {
        ft.text.destroy();
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateHUD(): void {
    this.events.emit('hud-update', {
      score: this.scoreSys.getTotal(),
      combo: this.comboSys.combo,
      multiplier: this.comboSys.getMultiplier(),
      level: this.difficultySys.getLevel(),
      survival: this.difficultySys.getTime(),
      dashCooldown: this.dashSys.cooldownPercent,
      dashReady: this.dashSys.cooldownPercent <= 0,
      isDashing: this.dashSys.isDashing,
      isInvuln: this.dashSys.isInvulnerable,
      activePowerup: this.powerupSys.getActiveKind(),
      powerupTime: this.powerupSys.getActiveKind()
        ? this.powerupSys.getRemaining(this.powerupSys.getActiveKind()!)
        : 0,
      hasShield: this.powerupSys.hasShield(),
      activeEvent: this.activeEvent,
      eventTime: this.eventSys.getEventTimeRemaining(),
    });
  }

  private gameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    AudioManager.playHit();
    AudioManager.playGameOver();
    AudioManager.stopMusic();
    if (this.settings.screenShake && !this.settings.reducedMotion) {
      this.cameras.main.shake(300, 0.012);
    }
    this.particles.emitParticleAt(this.player.x, this.player.y, 40);
    this.player.setVisible(false);
    this.playerGlow.setVisible(false);

    // Build run result
    const runResult: RunResult = {
      score: this.scoreSys.getTotal(),
      survivalSec: this.difficultySys.getTime(),
      highestCombo: this.highestComboThisRun,
      energy: 0, // updated below
      nearMisses: this.nearMissSys.getTotal(),
      level: this.difficultySys.getLevel(),
      newHighScore: false,
    };

    // Update persistent stats
    const prevSave = loadSave();
    const prevHigh = prevSave.stats.highScore;
    runResult.newHighScore = runResult.score > prevHigh;
    updateStats({
      highScore: Math.max(prevHigh, runResult.score),
      gamesPlayed: prevSave.stats.gamesPlayed + 1,
      totalSurvivalSec: prevSave.stats.totalSurvivalSec + runResult.survivalSec,
      highestCombo: Math.max(prevSave.stats.highestCombo, runResult.highestCombo),
      maxLevel: Math.max(prevSave.stats.maxLevel, runResult.level),
      nearMisses: prevSave.stats.nearMisses + runResult.nearMisses,
      dashDodges: prevSave.stats.dashDodges + this.dashDodgesThisRun,
    });

    // Track energy collected this run by counting score from pickups — approximate via combo sessions
    // We count energy precisely via a separate counter; for accuracy we track in collectEnergy
    runResult.energy = this.energyCollectedThisRun;
    updateStats({ totalEnergy: prevSave.stats.totalEnergy + runResult.energy });

    // Check achievements
    const statsAfter = loadSave().stats;
    const fullRunStats = { ...statsAfter };
    const alreadyUnlocked = new Set(
      Object.entries(loadSave().achievements)
        .filter(([, v]) => v.unlocked)
        .map(([k]) => k),
    );
    for (const ach of ACHIEVEMENTS) {
      if (!alreadyUnlocked.has(ach.id) && ach.check(fullRunStats, runResult)) {
        unlockAchievement(ach.id);
        useGameStore.getState().pushToast({ title: '🏆 ' + ach.name, body: ach.description, kind: 'achievement' });
      }
    }

    // Daily challenges
    const dateKey = todayKey();
    const challenges = generateDailyChallenges(dateKey);
    for (const ch of challenges) {
      if (checkDailyChallenge(ch, runResult)) {
        completeDailyChallenge(dateKey, ch.id);
      }
    }

    // Cosmetic unlocks
    const newUnlocks = checkUnlocks(loadSave().stats, loadSave().cosmetics.owned);
    for (const id of newUnlocks) {
      addOwnedCosmetic(id);
      useGameStore.getState().pushToast({ title: '🎨 Unlock: ' + id, kind: 'info' });
    }

    // Transition to result screen after brief delay
    this.time.delayedCall(800, () => {
      useGameStore.getState().onGameOver(runResult);
    });
  }

  private energyCollectedThisRun = 0;

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseOverlay?.setVisible(true);
      AudioManager.stopMusic();
    } else {
      this.pauseOverlay?.setVisible(false);
      if (this.settings.music) AudioManager.startMusic();
    }
  }

  private setupPauseOverlay(): void {
    const cx = this.arenaW / 2;
    const cy = this.arenaH / 2;
    const bg = this.add.rectangle(cx, cy, this.arenaW, this.arenaH, 0x000000, 0.7);
    const title = this.add.text(cx, cy - 60, 'PAUSED', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '48px',
      color: '#00f0ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const hint = this.add.text(cx, cy + 20, 'Tap or press ESC to resume', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const quit = this.add.text(cx, cy + 80, 'QUIT TO MENU', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '20px',
      color: '#ff3860',
    }).setOrigin(0.5);
    quit.setInteractive({ useHandCursor: true });
    quit.on('pointerup', () => {
      this.cleanupAndQuit();
    });

    bg.setInteractive();
    bg.on('pointerup', () => this.togglePause());

    this.pauseOverlay = this.add.container(0, 0, [bg, title, hint, quit]);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);
  }

  private cleanupAndQuit(): void {
    AudioManager.stopMusic();
    this.entities.releaseAll();
    useGameStore.getState().setScreen('home');
  }

  private setupLifecycle(): void {
    const onHide = (): void => {
      if (!this.isPaused && !this.isGameOver) {
        this.togglePause();
      }
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('blur', onHide);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', onHide);
      AudioManager.stopMusic();
    });
  }

  /** Called by React DASH button. */
  fireExternalDash(): void {
    this.input2?.fireExternalDash();
  }

  /** Called by React pause button. */
  pauseGame(): void {
    if (!this.isPaused) this.togglePause();
  }
}
