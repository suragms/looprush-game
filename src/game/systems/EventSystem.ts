import type { EventKind } from '@/types';
import { randRange, randPick } from '@/game/utils/math';

const ALL_EVENTS: EventKind[] = [
  'meteorRain',
  'blackout',
  'energyStorm',
  'speedSurge',
  'shrinkZone',
  'gravityShift',
  'laserGrid',
  'goldRush',
];

export class EventSystem {
  private timer = 0;
  private nextEventIn = 0;
  private currentEvent: EventKind | null = null;
  private eventDuration = 0;
  private eventTimer = 0;

  constructor() {
    this.nextEventIn = randRange(20, 40);
  }

  /** Returns the active event kind (or null). */
  getActiveEvent(): EventKind | null {
    return this.currentEvent;
  }

  /** Remaining duration of the active event. */
  getEventTimeRemaining(): number {
    return this.eventTimer > 0 ? this.eventTimer : 0;
  }

  /** Timer until the next event triggers. */
  getEventTimer(): number {
    return this.currentEvent ? 0 : this.nextEventIn - this.timer;
  }

  update(deltaSec: number): EventKind | null {
    // If an event is active, count down its duration
    if (this.currentEvent) {
      this.eventTimer -= deltaSec;
      if (this.eventTimer <= 0) {
        this.currentEvent = null;
        this.eventTimer = 0;
        // Start countdown to next event
        this.timer = 0;
        this.nextEventIn = randRange(20, 40);
      }
      return null;
    }

    // Counting down to next event
    this.timer += deltaSec;
    if (this.timer >= this.nextEventIn) {
      const kind = randPick(ALL_EVENTS);
      this.currentEvent = kind;
      this.eventDuration = this.getDurationForEvent(kind);
      this.eventTimer = this.eventDuration;
      return kind;
    }

    return null;
  }

  reset(): void {
    this.timer = 0;
    this.nextEventIn = randRange(20, 40);
    this.currentEvent = null;
    this.eventDuration = 0;
    this.eventTimer = 0;
  }

  private getDurationForEvent(kind: EventKind): number {
    switch (kind) {
      case 'blackout':
        return 5;
      case 'energyStorm':
        return 8;
      case 'speedSurge':
        return 6;
      case 'shrinkZone':
        return 8;
      case 'gravityShift':
        return 7;
      case 'goldRush':
        return 6;
      case 'meteorRain':
        return 4;
      case 'laserGrid':
        return 3;
      default:
        return 5;
    }
  }
}
