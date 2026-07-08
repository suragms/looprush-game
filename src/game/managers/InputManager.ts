/**
 * InputManager — unified input for desktop + mobile.
 *
 * Desktop: WASD / Arrow keys, Space=dash, Escape=pause.
 * Mobile:  drag on canvas = move, tap = dash, DASH button = dash.
 *
 * Consumes all input so the browser doesn't scroll/zoom during play.
 */
import Phaser from 'phaser';

export type InputState = {
  /** Normalised movement direction (-1..1 per axis). */
  moveX: number;
  moveY: number;
  /** True on the frame the dash action fires. */
  dash: boolean;
  /** True on the frame pause is requested. */
  pause: boolean;
};

export class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: Record<string, Phaser.Input.Keyboard.Key | null> = {
    up: null,
    down: null,
    left: null,
    right: null,
  };
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  /** Pointer drag tracking. */
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private pointerDownTime = 0;

  /** Callback from external DASH button. */
  private _externalDash = false;

  /** Output: consumed by GameScene. */
  readonly input: InputState = { moveX: 0, moveY: 0, dash: false, pause: false };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Keyboard
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd.up = scene.input.keyboard.addKey('W');
      this.wasd.down = scene.input.keyboard.addKey('S');
      this.wasd.left = scene.input.keyboard.addKey('A');
      this.wasd.right = scene.input.keyboard.addKey('D');
      this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      // Prevent browser defaults for game keys
      const gameKeys = [
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      ];
      scene.input.keyboard.addCapture(gameKeys);
    }

    // Pointer (touch + mouse)
    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);

    // Prevent context menu / selection during gameplay
    const canvas = scene.game.canvas as HTMLCanvasElement;
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) e.preventDefault();
    }, { passive: false });
  }

  /** Trigger dash from an external button. */
  fireExternalDash(): void {
    this._externalDash = true;
  }

  /** Call once per frame (before game logic reads `input`). */
  update(): void {
    let mx = 0;
    let my = 0;

    // Keyboard input
    if (this.cursors) {
      if (this.cursors.left.isDown || this.wasd.left?.isDown) mx -= 1;
      if (this.cursors.right.isDown || this.wasd.right?.isDown) mx += 1;
      if (this.cursors.up.isDown || this.wasd.up?.isDown) my -= 1;
      if (this.cursors.down.isDown || this.wasd.down?.isDown) my += 1;
    }

    // If keyboard is being used, override pointer movement.
    if (mx !== 0 || my !== 0) {
      this.isDragging = false;
    }

    // Pointer drag: direction from drag start to current pointer.
    if (this.isDragging) {
      const pointer = this.scene.input.activePointer;
      const dx = pointer.x - this.dragStartX;
      const dy = pointer.y - this.dragStartY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 10) {
        // Normalise, with magnitude clamped to 1.
        const mag = Math.min(d / 60, 1);
        mx = (dx / d) * mag;
        my = (dy / d) * mag;
      }
    }

    // Detect tap-to-dash (pointer down + up < 200ms, < 15px movement).
    const isTapDash = !this.isDragging && this._externalDash;

    const dash =
      isTapDash ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey as Phaser.Input.Keyboard.Key) ||
      false;

    const pause = Phaser.Input.Keyboard.JustDown(this.escKey as Phaser.Input.Keyboard.Key) || false;

    this.input.moveX = mx;
    this.input.moveY = my;
    this.input.dash = dash;
    this.input.pause = pause;

    // Reset single-frame flags
    this._externalDash = false;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
  }

  private onPointerDown(_pointer: Phaser.Input.Pointer): void {
    const p = this.scene.input.activePointer;
    this.dragStartX = p.x;
    this.dragStartY = p.y;
    this.isDragging = true;
    this.pointerDownTime = Date.now();
  }

  private onPointerMove(_pointer: Phaser.Input.Pointer): void {
    // Dragging state is checked in update()
  }

  private onPointerUp(_pointer: Phaser.Input.Pointer): void {
    const elapsed = Date.now() - this.pointerDownTime;
    // Short press without significant movement → treat as tap (for dash)
    // isDragging will still be true here if not moved much
    if (elapsed < 200 && this.isDragging) {
      const p = this.scene.input.activePointer;
      const dx = p.x - this.dragStartX;
      const dy = p.y - this.dragStartY;
      if (dx * dx + dy * dy < 15 * 15) {
        // This was a tap — fire dash
        this._externalDash = true;
        this.isDragging = false;
        return;
      }
    }
    this.isDragging = false;
  }
}
