import { PALETTE } from './palette';

type Vec3 = [number, number, number];

export interface DomeBall {
  /** Relative to the centre of the dome. */
  readonly position: Vec3;
  readonly rotation: Vec3;
  /** Colour of the top half (the bottom half is always white). */
  readonly color: string;
}

export const MINI_BALL_RADIUS = 0.17;

const TAU = Math.PI * 2;
const BALL_COLORS = [PALETTE.red, PALETTE.blue, PALETTE.yellow, PALETTE.purple] as const;

/**
 * The pile hugs the glass and leaves the central column empty: the ball that is
 * pulled falls straight down that column and into the hole in the floor.
 */
export const INNER_RING_RADIUS = 0.5;
const RINGS = [
  { y: -0.62, radius: INNER_RING_RADIUS, count: 5, startAngle: 0 },
  { y: -0.34, radius: 0.65, count: 5, startAngle: Math.PI / 5 },
] as const;

/** Deterministic pseudo-random in [0, 1): same pile on every render. */
const seeded = (n: number): number => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function buildLayout(): readonly DomeBall[] {
  const positions: Vec3[] = [];

  for (const { y, radius, count, startAngle } of RINGS) {
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i / count) * TAU;
      positions.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
  }

  return positions.map((position, index) => ({
    position,
    rotation: [seeded(index * 3 + 1) * TAU, seeded(index * 3 + 2) * TAU, seeded(index * 3 + 3) * TAU],
    color: BALL_COLORS[index % BALL_COLORS.length],
  }));
}

export const DOME_BALLS: readonly DomeBall[] = buildLayout();
