/** Normalised tilt: each axis goes from -1 (full left/up) to 1 (full right/down). */
export interface Tilt {
  readonly x: number;
  readonly y: number;
}

export const MAX_TILT_ANGLE_RAD = 0.35; // ~20°: the phone angle that counts as "full tilt"
export const SMOOTHING_FACTOR = 0.2; // 0 = frozen, 1 = no smoothing

const clampUnit = (value: number): number => Math.min(1, Math.max(-1, value));

/** Sensor angle (relative to the neutral pose) -> [-1, 1]. */
export function normalizeTilt(
  angleDeltaRad: number,
  maxAngleRad: number = MAX_TILT_ANGLE_RAD,
): number {
  return clampUnit(angleDeltaRad / maxAngleRad);
}

/** Finger drag distance -> [-1, 1], where 1 means "dragged half the card". */
export function normalizeDrag(deltaPx: number, halfSizePx: number): number {
  return halfSizePx > 0 ? clampUnit(deltaPx / halfSizePx) : 0;
}

/** Low-pass filter that removes sensor jitter. */
export function smoothTilt(
  previous: Tilt,
  target: Tilt,
  factor: number = SMOOTHING_FACTOR,
): Tilt {
  return {
    x: previous.x + (target.x - previous.x) * factor,
    y: previous.y + (target.y - previous.y) * factor,
  };
}
