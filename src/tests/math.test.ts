import { describe, it, expect } from 'vitest';
import { clamp, dist, distSq, lerp, angleTo, randRange, randPick } from '@/game/utils/math';

describe('clamp', () => {
  it('clamps low', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('clamps high', () => expect(clamp(15, 0, 10)).toBe(10));
  it('passes through', () => expect(clamp(5, 0, 10)).toBe(5));
});

describe('dist', () => {
  it('zero distance', () => expect(dist(0, 0, 0, 0)).toBe(0));
  it('horizontal', () => expect(dist(0, 0, 3, 0)).toBeCloseTo(3));
  it('diagonal', () => expect(dist(0, 0, 3, 4)).toBeCloseTo(5));
});

describe('distSq', () => {
  it('matches dist squared', () => {
    expect(distSq(1, 2, 4, 6)).toBeCloseTo(25);
  });
});

describe('lerp', () => {
  it('0 t returns a', () => expect(lerp(10, 20, 0)).toBe(10));
  it('1 t returns b', () => expect(lerp(10, 20, 1)).toBe(20));
  it('0.5 returns midpoint', () => expect(lerp(10, 20, 0.5)).toBe(15));
});

describe('angleTo', () => {
  it('0 angle for horizontal right', () => expect(angleTo(0, 0, 10, 0)).toBeCloseTo(0));
  it('PI/2 for down', () => expect(angleTo(0, 0, 0, 10)).toBeCloseTo(Math.PI / 2));
});

describe('randRange', () => {
  it('stays in range', () => {
    for (let i = 0; i < 100; i++) {
      const v = randRange(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });
});

describe('randPick', () => {
  it('picks from array', () => {
    const arr = [1, 2, 3, 4, 5];
    const picked = randPick(arr);
    expect(arr).toContain(picked);
  });
});
