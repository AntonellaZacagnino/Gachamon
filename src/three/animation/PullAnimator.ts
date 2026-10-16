import { SCENE_CONFIG } from '../config/sceneConfig';
import { IDLE_FRAME, PullFrame, REVEALED_FRAME } from './PullPhase';

type TimedPhase =
  | 'shaking'
  | 'falling'
  | 'inside'
  | 'exiting'
  | 'wobbling'
  | 'opening'
  | 'emerging';
export type AnimationDurations = Readonly<Record<TimedPhase, number>>;

interface Segment {
  readonly phase: TimedPhase;
  readonly durationMs: number;
}

const PHASE_ORDER: readonly TimedPhase[] = [
  'shaking',
  'falling',
  'inside',
  'exiting',
  'wobbling',
  'opening',
  'emerging',
];

/** Pure timeline: turns elapsed time into a phase. No Three.js, easy to test. */
export class PullAnimator {
  private readonly segments: readonly Segment[];

  constructor(durations: AnimationDurations = SCENE_CONFIG.animation) {
    this.segments = PHASE_ORDER.map((phase) => ({ phase, durationMs: durations[phase] }));
  }

  get totalMs(): number {
    return this.segments.reduce((sum, segment) => sum + segment.durationMs, 0);
  }

  frameAt(elapsedMs: number): PullFrame {
    if (elapsedMs < 0) return IDLE_FRAME;

    let remaining = elapsedMs;
    for (const { phase, durationMs } of this.segments) {
      if (remaining < durationMs) {
        return { phase, progress: remaining / durationMs };
      }
      remaining -= durationMs;
    }
    return REVEALED_FRAME;
  }
}
