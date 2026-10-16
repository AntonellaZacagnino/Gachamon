import { SCENE_CONFIG } from '../config/sceneConfig';
import {
  clamp01,
  easeInOutCubic,
  easeInQuad,
  easeOutBack,
  easeOutCubic,
  lerp,
} from './easing';
import { PullFrame } from './PullPhase';

export interface PokeBallPose {
  readonly visible: boolean;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** Uniform scale of the ball (it is smaller while inside the machine). */
  readonly scale: number;
  /** Rotation around X while rolling out of the slot (radians). */
  readonly roll: number;
  /** Rotation around Z: tumbling while it falls, rocking while it wobbles (radians). */
  readonly wobble: number;
  /** 0 = closed, 1 = fully open. */
  readonly openAmount: number;
  /** 0 = dark, 1 = full light burst. */
  readonly glow: number;
}

const { domeY, holeY, exitStartZ, chuteY, restZ, insideScale } = SCENE_CONFIG.ball;
const TAU = Math.PI * 2;
const WOBBLE_COUNT = 3;
const WOBBLE_AMPLITUDE = 0.35;
const SETTLED_GLOW = 0.5;
const TUMBLE_RADIANS = 1.2;
const HOP_HEIGHT = 0.12;

/** Horizontal jitter while the machine shakes (kept small so the ball never touches the pile). */
export const BALL_JITTER = 0.03;

const RESTING: PokeBallPose = {
  visible: true,
  x: 0,
  y: chuteY,
  z: restZ,
  scale: 1,
  roll: 0,
  wobble: 0,
  openAmount: 0,
  glow: 0,
};

/**
 * Pure function: where is the ball, and how open is it, for this frame?
 *
 * Journey: floats in the dome -> falls through the floor hole -> (hidden) travels
 * inside the body -> rolls out of the slot -> rests on the tray.
 */
export function pokeBallPose(frame: PullFrame, timeSeconds: number): PokeBallPose {
  const { progress } = frame;

  switch (frame.phase) {
    case 'idle':
      return { ...RESTING, visible: false, y: domeY, z: 0, scale: 0 };
    case 'shaking':
      return {
        ...RESTING,
        x: Math.sin(timeSeconds * 50) * BALL_JITTER,
        y: domeY + Math.sin(timeSeconds * 14) * 0.03,
        z: 0,
        scale: lerp(0, insideScale, easeOutBack(clamp01(progress * 5))), // pops in
      };
    case 'falling':
      return {
        ...RESTING,
        x: 0,
        y: lerp(domeY, holeY, easeInQuad(progress)), // accelerates like a falling object
        z: 0,
        scale: insideScale,
        wobble: progress * TUMBLE_RADIANS,
      };
    case 'inside':
      return {
        ...RESTING,
        visible: false, // fully behind the opaque body
        x: 0,
        y: lerp(holeY, chuteY, easeInQuad(progress)),
        z: lerp(0, exitStartZ, easeInOutCubic(progress)),
        scale: lerp(insideScale, 1, easeInOutCubic(progress)), // grows unseen
      };
    case 'exiting':
      return {
        ...RESTING,
        y: chuteY + Math.sin(progress * Math.PI) * HOP_HEIGHT * (1 - progress),
        z: lerp(exitStartZ, restZ, easeOutCubic(progress)),
        roll: easeOutCubic(progress) * TAU, // a full turn ends in the same orientation
      };
    case 'wobbling':
      return {
        ...RESTING,
        wobble: Math.sin(progress * Math.PI * 2 * WOBBLE_COUNT) * WOBBLE_AMPLITUDE * (1 - progress),
      };
    case 'opening': {
      const open = easeOutCubic(progress);
      return { ...RESTING, openAmount: open, glow: open };
    }
    case 'emerging':
      return { ...RESTING, openAmount: 1, glow: lerp(1, SETTLED_GLOW, progress) };
    case 'revealed':
      return { ...RESTING, openAmount: 1, glow: SETTLED_GLOW };
  }
}
