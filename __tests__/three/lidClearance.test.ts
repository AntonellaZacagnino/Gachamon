import { lidBackZ } from '../../src/three/animation/lidGeometry';
import { SCENE_CONFIG } from '../../src/three/config/sceneConfig';

const { ball, machine } = SCENE_CONFIG;
const SAFETY_MARGIN = 0.03;
const angles = Array.from({ length: 21 }, (_, i) => (i / 20) * ball.lidMaxAngle);

/**
 * Brute force, independent of the formula: sample the surface of the lid (a hemisphere
 * with its pole up) and place it like PokeBallModel does: hinge at the rear edge of the
 * ball, lid rotated by -angle around X, lid mesh offset by +radius in front of the hinge.
 */
function measureLidBackZ(angle: number, restZ: number, radius: number): number {
  const steps = 120;
  let minZ = Infinity;

  for (let i = 0; i <= steps; i++) {
    const polar = (i / steps) * (Math.PI / 2); // 0 = pole, π/2 = rim
    for (let j = 0; j < steps; j++) {
      const azimuth = (j / steps) * Math.PI * 2;
      const y = radius * Math.cos(polar);
      const z = radius * Math.sin(polar) * Math.sin(azimuth) + radius; // mesh offset in front of the hinge
      const rotatedZ = -y * Math.sin(angle) + z * Math.cos(angle); // rotation by -angle around X
      minZ = Math.min(minZ, restZ - radius + rotatedZ);
    }
  }
  return minZ;
}

describe('lidBackZ formula', () => {
  it.each([0, 0.5, 1.0, 1.22, 1.75, 2.5])('matches the brute-force measurement at %p rad', (angle) => {
    expect(lidBackZ(angle, 1.8, 0.45)).toBeCloseTo(measureLidBackZ(angle, 1.8, 0.45), 2);
  });
});

describe('open lid vs machine wall', () => {
  it('never crosses the machine front wall, at any point of the opening', () => {
    angles.forEach((angle) => {
      const reach = measureLidBackZ(angle, ball.restZ, ball.radius);
      expect(reach).toBeGreaterThanOrEqual(machine.frontZ + SAFETY_MARGIN);
    });
  });

  it('is clear according to the formula too', () => {
    angles.forEach((angle) => {
      expect(lidBackZ(angle)).toBeGreaterThanOrEqual(machine.frontZ + SAFETY_MARGIN);
    });
  });

  it('regression: the previous values (restZ 1.55, 100° lid) did cross the wall', () => {
    const reach = measureLidBackZ((100 * Math.PI) / 180, 1.55, 0.45);
    expect(reach).toBeLessThan(machine.frontZ);
  });

  it('still opens wide enough to show the inside (at least 60°)', () => {
    expect(ball.lidMaxAngle).toBeGreaterThanOrEqual((60 * Math.PI) / 180);
  });
});
