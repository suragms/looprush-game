/**
 * Generic object pool for Phaser game objects.
 * Reuse inactive instances to avoid per-frame allocations.
 */
import type Phaser from 'phaser';

export class ObjectPool<T extends Phaser.GameObjects.GameObject & { setVisible(value: boolean): any }> {
  private _pool: T[] = [];
  private _active: T[] = [];
  private _factory: () => T;

  constructor(factory: () => T, initialSize: number = 0) {
    this._factory = factory;
    for (let i = 0; i < initialSize; i++) {
      const obj = this._factory();
      obj.setActive(false).setVisible(false);
      this._pool.push(obj);
    }
  }

  /** Get an instance (reuses inactive, or creates new). */
  get(): T {
    let obj = this._pool.pop();
    if (!obj) {
      obj = this._factory();
    }
    obj.setActive(true).setVisible(true);
    this._active.push(obj);
    return obj;
  }

  /** Release an instance back to the pool. */
  release(obj: T): void {
    obj.setActive(false).setVisible(false);
    const idx = this._active.indexOf(obj);
    if (idx !== -1) this._active.splice(idx, 1);
    this._pool.push(obj);
  }

  /** Release all active instances. */
  releaseAll(): void {
    for (const obj of this._active) {
      obj.setActive(false).setVisible(false);
      this._pool.push(obj);
    }
    this._active.length = 0;
  }

  /** Iterate over active instances. */
  forEachActive(fn: (obj: T) => void): void {
    for (const obj of this._active) {
      if (obj.active) fn(obj);
    }
  }

  /** Number of active instances. */
  get activeCount(): number {
    return this._active.length;
  }
}
