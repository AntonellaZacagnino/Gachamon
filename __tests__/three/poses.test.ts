import { pokeBallPose } from '../../src/three/animation/pokeBallPose';
import { pokemonPose } from '../../src/three/animation/pokemonPose';
import { PullFrame, PullPhase } from '../../src/three/animation/PullPhase';
import { SCENE_CONFIG } from '../../src/three/config/sceneConfig';

const frame = (phase: PullPhase, progress = 0): PullFrame => ({ phase, progress });
const { ball, machine } = SCENE_CONFIG;
const bodyTopY = ball.domeY - machine.domeRadius;
const samples = Array.from({ length: 21 }, (_, i) => i / 20);

describe('pokeBallPose: journey through the machine', () => {
  it('is hidden while idle', () => {
    expect(pokeBallPose(frame('idle'), 0).visible).toBe(false);
  });

  it('pops in small, inside the dome, while the machine shakes', () => {
    const pose = pokeBallPose(frame('shaking', 1), 1);
    expect(pose.visible).toBe(true);
    expect(pose.z).toBe(0);
    expect(pose.y).toBeCloseTo(ball.domeY, 1);
    expect(pose.scale).toBeCloseTo(ball.insideScale);
  });

  it('falls straight down the dome from its centre to the floor hole', () => {
    const start = pokeBallPose(frame('falling', 0), 0);
    const end = pokeBallPose(frame('falling', 1), 0);
    expect(start.y).toBeCloseTo(ball.domeY);
    expect(end.y).toBeCloseTo(ball.holeY);
    expect(end.x).toBe(0);
    expect(end.z).toBe(0);
  });

  it('only falls downwards (never goes back up)', () => {
    const ys = samples.map((p) => pokeBallPose(frame('falling', p), 0).y);
    ys.slice(1).forEach((y, i) => expect(y).toBeLessThanOrEqual(ys[i] + 1e-9));
  });

  it('is completely below the dome floor when it disappears', () => {
    const top = ball.holeY + ball.radius * ball.insideScale;
    expect(top).toBeLessThanOrEqual(bodyTopY);
  });

  it('is hidden while travelling inside the body', () => {
    samples.forEach((p) => expect(pokeBallPose(frame('inside', p), 0).visible).toBe(false));
  });

  it('travels from the hole to just behind the slot, growing to full size', () => {
    const start = pokeBallPose(frame('inside', 0), 0);
    const end = pokeBallPose(frame('inside', 1), 0);
    expect(start.y).toBeCloseTo(ball.holeY);
    expect(start.z).toBeCloseTo(0);
    expect(end.y).toBeCloseTo(ball.chuteY);
    expect(end.z).toBeCloseTo(ball.exitStartZ);
    expect(end.scale).toBeCloseTo(1);
  });

  it('is still entirely behind the front wall when it reappears (no pop)', () => {
    expect(ball.exitStartZ + ball.radius).toBeLessThanOrEqual(machine.frontZ);
  });

  it('stays hidden and never intersects the body top while inside', () => {
    samples.forEach((p) => {
      const pose = pokeBallPose(frame('inside', p), 0);
      expect(pose.y + ball.radius * pose.scale).toBeLessThanOrEqual(bodyTopY + 1e-9);
    });
  });

  it('rolls out of the slot and stops on the tray after one full turn', () => {
    const start = pokeBallPose(frame('exiting', 0), 0);
    const end = pokeBallPose(frame('exiting', 1), 0);
    expect(start.z).toBeCloseTo(ball.exitStartZ);
    expect(end.z).toBeCloseTo(ball.restZ);
    expect(end.y).toBeCloseTo(ball.chuteY);
    expect(end.roll).toBeCloseTo(Math.PI * 2);
  });

  it('never sinks into the tray while exiting', () => {
    samples.forEach((p) =>
      expect(pokeBallPose(frame('exiting', p), 0).y).toBeGreaterThanOrEqual(ball.chuteY - 1e-9),
    );
  });

  it('is continuous between phases (no teleporting)', () => {
    const pairs: Array<[PullFrame, PullFrame]> = [
      [frame('falling', 1), frame('inside', 0)],
      [frame('inside', 1), frame('exiting', 0)],
      [frame('exiting', 1), frame('wobbling', 0)],
    ];
    pairs.forEach(([a, b]) => {
      const from = pokeBallPose(a, 0);
      const to = pokeBallPose(b, 0);
      expect(to.y).toBeCloseTo(from.y);
      expect(to.z).toBeCloseTo(from.z);
    });
  });

  it('rocks during the wobble and settles at the end', () => {
    const swing = pokeBallPose(frame('wobbling', 1 / 12), 0).wobble;
    expect(swing).toBeGreaterThan(0.2);
    expect(swing).toBeLessThanOrEqual(0.35);
    expect(pokeBallPose(frame('wobbling', 0), 0).wobble).toBeCloseTo(0);
    expect(pokeBallPose(frame('wobbling', 1), 0).wobble).toBeCloseTo(0);
  });

  it('opens the lid and bursts light during the opening phase', () => {
    expect(pokeBallPose(frame('opening', 0), 0).openAmount).toBe(0);
    const end = pokeBallPose(frame('opening', 1), 0);
    expect(end.openAmount).toBeCloseTo(1);
    expect(end.glow).toBeCloseTo(1);
  });

  it('stays open, at full size, and dims the light once revealed', () => {
    const pose = pokeBallPose(frame('revealed', 1), 0);
    expect(pose.openAmount).toBe(1);
    expect(pose.scale).toBe(1);
    expect(pose.glow).toBeCloseTo(0.5);
  });
});

describe('pokemonPose', () => {
  it.each(['idle', 'shaking', 'falling', 'inside', 'exiting', 'wobbling', 'opening'] as const)(
    'is hidden during %p',
    (phase) => {
      expect(pokemonPose(frame(phase, 0.5)).visible).toBe(false);
    },
  );

  it('starts tiny and low, then settles above the ball', () => {
    const start = pokemonPose(frame('emerging', 0));
    expect(start.visible).toBe(true);
    expect(start.scale).toBeCloseTo(0.05);
    expect(start.opacity).toBe(0);

    const end = pokemonPose(frame('emerging', 1));
    expect(end.y).toBeCloseTo(SCENE_CONFIG.pokemon.revealY);
    expect(end.scale).toBeCloseTo(1);
    expect(end.opacity).toBe(1);
  });

  it('is fully visible once revealed', () => {
    expect(pokemonPose(frame('revealed', 1))).toEqual({
      visible: true,
      y: SCENE_CONFIG.pokemon.revealY,
      scale: 1,
      opacity: 1,
    });
  });
});
