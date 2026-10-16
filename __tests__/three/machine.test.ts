import {
  bulbGlow,
  chuteGlow,
  dialAngle,
  domeBallOffset,
  machineShake,
  SHAKE_AMPLITUDE,
} from '../../src/three/animation/machineAnimation';
import { BALL_JITTER } from '../../src/three/animation/pokeBallPose';
import { PullFrame, PullPhase } from '../../src/three/animation/PullPhase';
import { DOME_BALLS, MINI_BALL_RADIUS } from '../../src/three/config/domeBallLayout';
import { SCENE_CONFIG } from '../../src/three/config/sceneConfig';

const frame = (phase: PullPhase, progress = 0): PullFrame => ({ phase, progress });
const PHASES: PullPhase[] = [
  'idle', 'shaking', 'falling', 'inside', 'exiting', 'wobbling', 'opening', 'emerging', 'revealed',
];
const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const { ball, machine } = SCENE_CONFIG;

describe('dome ball layout', () => {
  it('keeps every small ball inside the glass dome', () => {
    DOME_BALLS.forEach((b) => {
      expect(Math.hypot(...b.position) + MINI_BALL_RADIUS).toBeLessThanOrEqual(machine.domeRadius);
    });
  });

  it('has no overlapping balls', () => {
    DOME_BALLS.forEach((a, i) =>
      DOME_BALLS.slice(i + 1).forEach((b) =>
        expect(distance(a.position, b.position)).toBeGreaterThanOrEqual(MINI_BALL_RADIUS * 2 - 1e-9),
      ),
    );
  });

  it('leaves the central column free for the falling ball, even while everything shakes', () => {
    const ballRadius = ball.radius * ball.insideScale;
    DOME_BALLS.forEach((b) => {
      const horizontal = Math.hypot(b.position[0], b.position[2]);
      expect(horizontal).toBeGreaterThanOrEqual(
        ballRadius + MINI_BALL_RADIUS + SHAKE_AMPLITUDE + BALL_JITTER - 1e-9,
      );
    });
  });

  it('has an empty centre: no small ball sits over the floor hole', () => {
    DOME_BALLS.forEach((b) =>
      expect(Math.hypot(b.position[0], b.position[2])).toBeGreaterThan(machine.holeRadius),
    );
  });
});

describe('domeBallOffset', () => {
  it('stays still unless the machine is shaking', () => {
    PHASES.filter((phase) => phase !== 'shaking').forEach((phase) =>
      expect(domeBallOffset(frame(phase, 0.5), 1.234, 3)).toEqual({ x: 0, y: 0, z: 0, spin: 0 }),
    );
  });

  it('stays within the shake amplitude while shaking', () => {
    for (let time = 0; time < 5; time += 0.37) {
      const offset = domeBallOffset(frame('shaking', 0.3), time, 4);
      expect(Math.abs(offset.x)).toBeLessThanOrEqual(SHAKE_AMPLITUDE);
      expect(Math.abs(offset.z)).toBeLessThanOrEqual(SHAKE_AMPLITUDE);
      expect(offset.y).toBeGreaterThanOrEqual(0);
      expect(offset.y).toBeLessThanOrEqual(SHAKE_AMPLITUDE);
    }
  });
});

describe('dialAngle', () => {
  it('turns one full revolution during the shake', () => {
    expect(dialAngle(frame('shaking', 0))).toBe(0);
    expect(dialAngle(frame('shaking', 1))).toBeCloseTo(Math.PI * 2);
  });

  it('rests at zero in every other phase', () => {
    PHASES.filter((phase) => phase !== 'shaking').forEach((phase) =>
      expect(dialAngle(frame(phase, 0.7))).toBe(0),
    );
  });
});

describe('bulbGlow', () => {
  it('always stays within [0, 1]', () => {
    PHASES.forEach((phase) => {
      for (let index = 0; index < 5; index++) {
        for (let time = 0; time < 3; time += 0.21) {
          const glow = bulbGlow(frame(phase, 0.5), time, index);
          expect(glow).toBeGreaterThanOrEqual(0);
          expect(glow).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  it('is steady when idle and animated while the ball travels', () => {
    expect(bulbGlow(frame('idle'), 0, 0)).toBe(bulbGlow(frame('idle'), 5, 0));
    expect(bulbGlow(frame('inside'), 0, 0)).not.toBe(bulbGlow(frame('inside'), 0.1, 0));
  });
});

describe('machineShake', () => {
  it('shakes, then only rumbles gently while the ball is inside', () => {
    let maxShake = 0;
    let maxRumble = 0;
    for (let time = 0; time < 3; time += 0.013) {
      maxShake = Math.max(maxShake, Math.abs(machineShake(frame('shaking', 0), time)));
      maxRumble = Math.max(maxRumble, Math.abs(machineShake(frame('inside', 0.5), time)));
    }
    expect(maxShake).toBeGreaterThan(0.02);
    expect(maxRumble).toBeGreaterThan(0);
    expect(maxRumble).toBeLessThan(maxShake);
  });

  it('gives a brief jolt as the ball leaves the slot, then calms down', () => {
    expect(Math.abs(machineShake(frame('exiting', 0.02), 0.05))).toBeGreaterThan(0);
    expect(machineShake(frame('exiting', 0.5), 1.234)).toBe(0);
  });

  it('is still in every other phase', () => {
    (['idle', 'falling', 'wobbling', 'opening', 'emerging', 'revealed'] as const).forEach((phase) =>
      expect(machineShake(frame(phase, 0.5), 1.234)).toBe(0),
    );
  });
});

describe('chuteGlow', () => {
  it('builds while the ball approaches and fades as it leaves, without jumps', () => {
    expect(chuteGlow(frame('inside', 0))).toBe(0);
    expect(chuteGlow(frame('inside', 1))).toBeCloseTo(chuteGlow(frame('exiting', 0)));
    expect(chuteGlow(frame('exiting', 1))).toBe(0);
  });

  it('stays dark otherwise', () => {
    (['idle', 'shaking', 'falling', 'wobbling', 'opening', 'emerging', 'revealed'] as const).forEach(
      (phase) => expect(chuteGlow(frame(phase, 0.5))).toBe(0),
    );
  });
});

describe('machine geometry matches the ball animation anchors', () => {
  it('rests the ball on the tray', () => {
    expect(ball.chuteY - ball.radius).toBeCloseTo(machine.trayTopY);
  });

  it('rolls the ball out in front of the machine, within the tray', () => {
    expect(ball.restZ - ball.radius).toBeGreaterThanOrEqual(machine.frontZ);
    expect(ball.restZ + ball.radius).toBeLessThanOrEqual(machine.trayEndZ);
  });

  it('puts the dome base flush with the top of the body', () => {
    expect(ball.domeY - machine.domeRadius).toBeCloseTo(0.2);
  });

  it('inscribes the round dome in the square body', () => {
    expect(machine.domeRadius * 2).toBeLessThanOrEqual(Math.min(machine.width, machine.depth));
  });

  it('lets the ball fit through the floor hole, even at its smaller inside size', () => {
    expect(ball.radius * ball.insideScale).toBeLessThanOrEqual(machine.holeRadius);
  });
});
