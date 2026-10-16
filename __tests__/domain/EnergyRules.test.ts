import { DEFAULT_ENERGY_CONFIG } from '../../src/domain/config/energyConfig';
import { InsufficientEnergyError } from '../../src/domain/errors/InsufficientEnergyError';
import { EnergyRules } from '../../src/domain/services/EnergyRules';

const MIN = 60 * 1000;
const T0 = 1_700_000_000_000;
const rules = new EnergyRules();

describe('the requested configuration', () => {
  it('is 20 max, 2 per pull, 1 point every 5 minutes', () => {
    expect(DEFAULT_ENERGY_CONFIG).toEqual({ maxPoints: 20, costPerPull: 2, regenIntervalMs: 5 * MIN });
  });

  it('gives a new player full energy', () => {
    expect(rules.initial(T0)).toEqual({ points: 20, lastRegenAt: T0 });
  });
});

describe('spend', () => {
  it('costs 2 points per pull', () => {
    expect(rules.spend(rules.initial(T0), T0).points).toBe(18);
  });

  it('allows exactly 10 pulls from full energy, then refuses the 11th', () => {
    let state = rules.initial(T0);
    for (let pull = 1; pull <= 10; pull++) state = rules.spend(state, T0);

    expect(state.points).toBe(0);
    expect(() => rules.spend(state, T0)).toThrow(InsufficientEnergyError);
  });

  it('refuses with 1 point left (less than the cost of 2)', () => {
    expect(() => rules.spend({ points: 1, lastRegenAt: T0 }, T0)).toThrow(InsufficientEnergyError);
  });

  it('allows a pull with exactly 2 points', () => {
    expect(rules.spend({ points: 2, lastRegenAt: T0 }, T0).points).toBe(0);
  });

  it('starts the recovery clock when spending from full energy', () => {
    expect(rules.spend(rules.initial(T0), T0 + 7 * MIN)).toEqual({ points: 18, lastRegenAt: T0 + 7 * MIN });
  });

  it('keeps the running recovery clock when spending from partial energy', () => {
    const state = { points: 10, lastRegenAt: T0 };
    expect(rules.spend(state, T0 + 2 * MIN)).toEqual({ points: 8, lastRegenAt: T0 });
  });

  it('does not change the state it receives', () => {
    const state = { points: 10, lastRegenAt: T0 };
    rules.spend(state, T0);
    expect(state).toEqual({ points: 10, lastRegenAt: T0 });
  });
});

describe('recovery: 1 point every 5 minutes', () => {
  const empty = { points: 0, lastRegenAt: T0 };

  it.each([
    [0, 0],
    [4 * MIN + 59_000, 0],
    [5 * MIN, 1],
    [10 * MIN, 2],
    [59 * MIN, 11],
    [100 * MIN, 20],
    [1000 * MIN, 20],
  ])('after %p ms an empty meter has %p points', (elapsed, points) => {
    expect(rules.refresh(empty, T0 + elapsed).points).toBe(points);
  });

  it('keeps the leftover time instead of losing it', () => {
    // 12 minutes = 2 points + 2 minutes towards the next one
    expect(rules.refresh(empty, T0 + 12 * MIN)).toEqual({ points: 2, lastRegenAt: T0 + 10 * MIN });
  });

  it('never goes above the maximum, and the timer stops when full', () => {
    expect(rules.refresh({ points: 19, lastRegenAt: T0 }, T0 + 50 * MIN)).toEqual({
      points: 20,
      lastRegenAt: T0 + 50 * MIN,
    });
  });

  it('is the same whether you check often or once at the end', () => {
    let step = empty;
    for (let minute = 1; minute <= 37; minute++) step = rules.refresh(step, T0 + minute * MIN);
    expect(step).toEqual(rules.refresh(empty, T0 + 37 * MIN));
  });

  it('lets a player who ran out pull again after 10 minutes', () => {
    const spent = { points: 0, lastRegenAt: T0 };
    expect(() => rules.spend(spent, T0 + 9 * MIN)).toThrow(InsufficientEnergyError);
    expect(rules.spend(spent, T0 + 10 * MIN).points).toBe(0);
  });

  it('recovers while the app is closed (it only depends on the time that passed)', () => {
    const state = rules.spend(rules.initial(T0), T0); // 18, timer starts at T0
    expect(rules.status(state, T0 + 3 * 60 * MIN).points).toBe(20);
  });
});

describe('status', () => {
  it('shows a full meter without a countdown', () => {
    expect(rules.status(rules.initial(T0), T0)).toEqual({
      points: 20, max: 20, costPerPull: 2, canPull: true, isFull: true, msUntilNextPoint: null, msUntilCanPull: 0,
    });
  });

  it('counts down to the next point', () => {
    const status = rules.status({ points: 10, lastRegenAt: T0 }, T0 + 2 * MIN);
    expect(status.msUntilNextPoint).toBe(3 * MIN);
    expect(status.canPull).toBe(true);
    expect(status.msUntilCanPull).toBe(0);
  });

  it('with 1 point, the next pull is available when the next point arrives', () => {
    const status = rules.status({ points: 1, lastRegenAt: T0 }, T0 + 2 * MIN);
    expect(status.canPull).toBe(false);
    expect(status.msUntilCanPull).toBe(3 * MIN);
  });

  it('with 0 points, the next pull needs two points: 10 minutes from the start of the interval', () => {
    const status = rules.status({ points: 0, lastRegenAt: T0 }, T0);
    expect(status.canPull).toBe(false);
    expect(status.msUntilCanPull).toBe(10 * MIN);
  });

  it('with 0 points and 3 minutes elapsed, 7 minutes remain', () => {
    expect(rules.status({ points: 0, lastRegenAt: T0 }, T0 + 3 * MIN).msUntilCanPull).toBe(7 * MIN);
  });

  it('is consistent: when the wait reaches 0 a pull really is possible', () => {
    const state = { points: 0, lastRegenAt: T0 };
    const wait = rules.status(state, T0 + MIN).msUntilCanPull;
    expect(rules.status(state, T0 + MIN + wait).canPull).toBe(true);
    expect(rules.status(state, T0 + MIN + wait - 1).canPull).toBe(false);
  });
});

describe('refund', () => {
  it('gives back the cost of a pull', () => {
    const spent = rules.spend(rules.initial(T0), T0);
    expect(rules.refund(spent, T0).points).toBe(20);
  });

  it('never exceeds the maximum', () => {
    expect(rules.refund({ points: 19, lastRegenAt: T0 }, T0).points).toBe(20);
  });

  it('does not reset the recovery clock when still below the maximum', () => {
    expect(rules.refund({ points: 4, lastRegenAt: T0 }, T0 + MIN)).toEqual({ points: 6, lastRegenAt: T0 });
  });
});

describe('unreliable clock and data', () => {
  it('restarts the interval (instead of freezing recovery) when the device clock goes backwards', () => {
    const state = { points: 4, lastRegenAt: T0 + 100 * MIN };
    const refreshed = rules.refresh(state, T0);
    expect(refreshed).toEqual({ points: 4, lastRegenAt: T0 });
    expect(rules.refresh(refreshed, T0 + 5 * MIN).points).toBe(5);
  });

  it('starts fresh with missing or broken saved data', () => {
    expect(rules.sanitize(null, T0)).toEqual(rules.initial(T0));
    expect(rules.sanitize({ points: NaN, lastRegenAt: T0 }, T0)).toEqual(rules.initial(T0));
    expect(rules.sanitize({ points: 5, lastRegenAt: Infinity }, T0)).toEqual(rules.initial(T0));
  });

  it('clamps out-of-range points and drops fractions', () => {
    expect(rules.sanitize({ points: 99, lastRegenAt: T0 }, T0).points).toBe(20);
    expect(rules.sanitize({ points: -5, lastRegenAt: T0 }, T0).points).toBe(0);
    expect(rules.sanitize({ points: 7.9, lastRegenAt: T0 }, T0).points).toBe(7);
  });
});

describe('configuration validation', () => {
  it('rejects impossible configurations', () => {
    expect(() => new EnergyRules({ maxPoints: 1, costPerPull: 2, regenIntervalMs: 1000 })).toThrow();
    expect(() => new EnergyRules({ maxPoints: 20, costPerPull: 0, regenIntervalMs: 1000 })).toThrow();
    expect(() => new EnergyRules({ maxPoints: 20, costPerPull: 2, regenIntervalMs: 0 })).toThrow();
    expect(() => new EnergyRules({ maxPoints: 20.5, costPerPull: 2, regenIntervalMs: 1000 })).toThrow();
  });
});
