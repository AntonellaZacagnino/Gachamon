import { PullAnimator } from '../../src/three/animation/PullAnimator';

const animator = new PullAnimator({
  shaking: 100,
  falling: 100,
  inside: 100,
  exiting: 100,
  wobbling: 100,
  opening: 100,
  emerging: 100,
});

describe('PullAnimator', () => {
  it('reports total duration', () => {
    expect(animator.totalMs).toBe(700);
  });

  it.each([
    [-1, 'idle', 0],
    [0, 'shaking', 0],
    [50, 'shaking', 0.5],
    [100, 'falling', 0],
    [200, 'inside', 0],
    [300, 'exiting', 0],
    [350, 'exiting', 0.5],
    [400, 'wobbling', 0],
    [500, 'opening', 0],
    [600, 'emerging', 0],
    [699, 'emerging', 0.99],
    [700, 'revealed', 1],
    [9999, 'revealed', 1],
  ])('at %p ms returns phase %p (progress %p)', (elapsed, phase, progress) => {
    const frame = animator.frameAt(elapsed);
    expect(frame.phase).toBe(phase);
    expect(frame.progress).toBeCloseTo(progress as number);
  });
});
