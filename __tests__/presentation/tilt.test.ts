import {
  MAX_TILT_ANGLE_RAD,
  normalizeDrag,
  normalizeTilt,
  smoothTilt,
} from '../../src/presentation/effects/tilt';

describe('normalizeTilt', () => {
  it('maps the maximum angle to 1 and half of it to 0.5', () => {
    expect(normalizeTilt(MAX_TILT_ANGLE_RAD)).toBeCloseTo(1);
    expect(normalizeTilt(MAX_TILT_ANGLE_RAD / 2)).toBeCloseTo(0.5);
  });

  it('keeps the sign and clamps to [-1, 1]', () => {
    expect(normalizeTilt(-MAX_TILT_ANGLE_RAD / 2)).toBeCloseTo(-0.5);
    expect(normalizeTilt(10)).toBe(1);
    expect(normalizeTilt(-10)).toBe(-1);
  });

  it('is neutral at zero', () => {
    expect(normalizeTilt(0)).toBe(0);
  });
});

describe('normalizeDrag', () => {
  it('maps half the card size to full tilt', () => {
    expect(normalizeDrag(100, 100)).toBe(1);
    expect(normalizeDrag(-50, 100)).toBe(-0.5);
  });

  it('clamps long drags and ignores a zero size', () => {
    expect(normalizeDrag(500, 100)).toBe(1);
    expect(normalizeDrag(50, 0)).toBe(0);
  });
});

describe('smoothTilt', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 1, y: -1 };

  it('moves a fraction of the way towards the target', () => {
    expect(smoothTilt(from, to, 0.25)).toEqual({ x: 0.25, y: -0.25 });
  });

  it('converges: factor 1 reaches the target, factor 0 stays put', () => {
    expect(smoothTilt(from, to, 1)).toEqual(to);
    expect(smoothTilt(from, to, 0)).toEqual(from);
  });
});
