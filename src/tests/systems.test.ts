import { describe, it, expect, beforeEach } from 'vitest';
import { ComboSystem } from '@/game/systems/ComboSystem';
import { ScoringSystem } from '@/game/systems/ScoringSystem';
import { DifficultySystem } from '@/game/systems/DifficultySystem';
import { DashSystem } from '@/game/systems/DashSystem';
import { PowerupSystem } from '@/game/systems/PowerupSystem';
import { BALANCE } from '@/game/config/balance';

describe('ComboSystem', () => {
  let combo: ComboSystem;
  beforeEach(() => { combo = new ComboSystem(); });

  it('starts at 0', () => expect(combo.combo).toBe(0));

  it('increments on collect', () => {
    const c = combo.collectEnergy(0);
    expect(c).toBe(1);
    expect(combo.combo).toBe(1);
  });

  it('decays after timeout', () => {
    combo.collectEnergy(0);
    combo.update(BALANCE.combo.decayTime + 0.01);
    expect(combo.combo).toBe(0);
  });

  it('does not decay while collecting', () => {
    combo.collectEnergy(0);
    combo.update(BALANCE.combo.decayTime * 0.5);
    combo.collectEnergy(1);
    combo.update(BALANCE.combo.decayTime * 0.5);
    expect(combo.combo).toBeGreaterThan(0);
  });

  it('reset clears combo', () => {
    combo.collectEnergy(0);
    combo.reset();
    expect(combo.combo).toBe(0);
  });
});

describe('ScoringSystem', () => {
  let score: ScoringSystem;
  beforeEach(() => { score = new ScoringSystem(); });

  it('starts at 0', () => expect(score.getTotal()).toBe(0));

  it('adds energy pickup score', () => {
    score.addEnergyPickup(5, false);
    expect(score.getTotal()).toBeGreaterThan(0);
  });

  it('adds near miss score', () => {
    score.addNearMiss(1);
    expect(score.getTotal()).toBe(BALANCE.nearMiss.score);
  });

  it('adds survival score over time', () => {
    const before = score.getTotal();
    score.addSurvival(1, 1, 0);
    expect(score.getTotal()).toBeGreaterThan(before);
  });

  it('reset clears score', () => {
    score.addEnergyPickup(5, false);
    score.reset();
    expect(score.getTotal()).toBe(0);
  });
});

describe('DifficultySystem', () => {
  let diff: DifficultySystem;
  beforeEach(() => { diff = new DifficultySystem(); });

  it('starts at level 1', () => expect(diff.getLevel()).toBe(1));

  it('levels up at 30s', () => {
    diff.update(30, 0);
    expect(diff.getLevel()).toBe(2);
  });

  it('sets justLeveledUp flag', () => {
    diff.update(30, 0);
    expect(diff.justLeveledUp).toBe(true);
    diff.update(0.1, 0);
    expect(diff.justLeveledUp).toBe(false);
  });

  it('obstacle speed increases', () => {
    const speed1 = diff.getObstacleSpeed();
    diff.update(30, 0);
    expect(diff.getObstacleSpeed()).toBeGreaterThan(speed1);
  });

  it('reset', () => {
    diff.update(60, 0);
    diff.reset();
    expect(diff.getLevel()).toBe(1);
  });
});

describe('DashSystem', () => {
  let dash: DashSystem;
  beforeEach(() => { dash = new DashSystem(); });

  it('starts ready', () => expect(dash.cooldownPercent).toBe(0));

  it('dashes successfully', () => {
    expect(dash.tryDash(1, 0)).toBe(true);
    expect(dash.isDashing).toBe(true);
  });

  it('cannot dash twice', () => {
    dash.tryDash(1, 0);
    expect(dash.tryDash(1, 0)).toBe(false);
  });

  it('cooldown fills after dash', () => {
    dash.tryDash(1, 0);
    dash.update(BALANCE.dash.duration + BALANCE.dash.cooldown + 0.01);
    expect(dash.cooldownPercent).toBe(0);
  });

  it('reset', () => {
    dash.tryDash(1, 0);
    dash.reset();
    expect(dash.isDashing).toBe(false);
    expect(dash.cooldownPercent).toBe(0);
  });
});

describe('PowerupSystem', () => {
  let pw: PowerupSystem;
  beforeEach(() => { pw = new PowerupSystem(); });

  it('no powerups at start', () => expect(pw.getActiveKind()).toBeNull());

  it('shield works', () => {
    pw.collect('shield');
    expect(pw.hasShield()).toBe(true);
  });

  it('shield consumed', () => {
    pw.collect('shield');
    expect(pw.consumeShield()).toBe(true);
    expect(pw.hasShield()).toBe(false);
  });

  it('ghost mode works', () => {
    pw.collect('ghostMode');
    expect(pw.isGhostMode()).toBe(true);
  });

  it('score boost doubles', () => {
    pw.collect('scoreBoost');
    expect(pw.getScoreMultiplier()).toBe(2);
  });

  it('slow time halves', () => {
    pw.collect('slowTime');
    expect(pw.getSlowFactor()).toBe(0.5);
  });

  it('timed powerup expires', () => {
    pw.collect('ghostMode');
    pw.update(5.1);
    expect(pw.isGhostMode()).toBe(false);
  });

  it('reset clears all', () => {
    pw.collect('shield');
    pw.collect('ghostMode');
    pw.reset();
    expect(pw.getActiveKind()).toBeNull();
  });
});
