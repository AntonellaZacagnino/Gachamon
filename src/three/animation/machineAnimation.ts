import { easeOutCubic } from './easing';
import { PullFrame } from './PullPhase';

const TAU = Math.PI * 2;
/** World units; together with BALL_JITTER it must stay below the gap in the dome pile. */
export const SHAKE_AMPLITUDE = 0.03;
const IDLE_BULB_GLOW = 0.6;

export interface DomeBallOffset {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly spin: number;
}

const NO_OFFSET: DomeBallOffset = { x: 0, y: 0, z: 0, spin: 0 };

/** The small balls in the dome tumble while the machine shakes. */
export function domeBallOffset(frame: PullFrame, timeSeconds: number, index: number): DomeBallOffset {
  if (frame.phase !== 'shaking') return NO_OFFSET;

  const amplitude = SHAKE_AMPLITUDE * (1 - frame.progress * 0.5);
  return {
    x: Math.sin(timeSeconds * 30 + index * 1.7) * amplitude,
    y: Math.abs(Math.sin(timeSeconds * 24 + index * 2.3)) * amplitude,
    z: Math.sin(timeSeconds * 27 + index * 0.9) * amplitude,
    spin: Math.sin(timeSeconds * 20 + index) * 0.6,
  };
}

/** The front dial makes one full turn while the machine shakes. */
export function dialAngle(frame: PullFrame): number {
  return frame.phase === 'shaking' ? easeOutCubic(frame.progress) * TAU : 0;
}

/** Marquee bulbs: steady when idle, blink while shaking, chase while the ball travels or opens. */
export function bulbGlow(frame: PullFrame, timeSeconds: number, index: number): number {
  switch (frame.phase) {
    case 'shaking':
      return 0.5 + 0.5 * Math.sin(timeSeconds * 18 + index * Math.PI);
    case 'falling':
    case 'inside':
    case 'exiting':
      return 0.5 + 0.5 * Math.sin(timeSeconds * 14 - index * 1.2); // lights run towards the slot
    case 'opening':
    case 'emerging':
      return 0.5 + 0.5 * Math.sin(timeSeconds * 8 + index * 1.2);
    default:
      return IDLE_BULB_GLOW;
  }
}

/** Rotation of the whole machine around Z: a shake, then a rumble while the ball travels inside. */
export function machineShake(frame: PullFrame, timeSeconds: number): number {
  switch (frame.phase) {
    case 'shaking':
      return Math.sin(timeSeconds * 40) * 0.03 * (1 - frame.progress);
    case 'inside':
      return Math.sin(timeSeconds * 45) * 0.012;
    case 'exiting': {
      const kick = 0.15; // a small jolt as the ball leaves the slot
      return frame.progress < kick
        ? Math.sin(timeSeconds * 60) * 0.02 * (1 - frame.progress / kick)
        : 0;
    }
    default:
      return 0;
  }
}

/** Glow of the slot rim: builds while the ball approaches inside, fades as it leaves. */
export function chuteGlow(frame: PullFrame): number {
  switch (frame.phase) {
    case 'inside':
      return frame.progress;
    case 'exiting':
      return 1 - frame.progress;
    default:
      return 0;
  }
}
