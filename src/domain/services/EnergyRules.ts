import { DEFAULT_ENERGY_CONFIG, EnergyConfig } from '../config/energyConfig';
import { EnergyState, EnergyStatus } from '../entities/Energy';
import { InsufficientEnergyError } from '../errors/InsufficientEnergyError';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * The pure rules of the energy system: no clock, no storage, no state.
 * Every method takes the current state and the current time, and returns a new state.
 */
export class EnergyRules {
  constructor(readonly config: EnergyConfig = DEFAULT_ENERGY_CONFIG) {
    const { maxPoints, costPerPull, regenIntervalMs } = config;
    if (!Number.isInteger(maxPoints) || !Number.isInteger(costPerPull)) {
      throw new Error('Energy max and cost must be whole numbers');
    }
    if (costPerPull < 1 || maxPoints < costPerPull) {
      throw new Error('Energy max must be at least the cost of one pull');
    }
    if (regenIntervalMs <= 0) {
      throw new Error('Energy recovery interval must be positive');
    }
  }

  /** A new player starts with full energy. */
  initial(now: number): EnergyState {
    return { points: this.config.maxPoints, lastRegenAt: now };
  }

  /** Makes saved data safe to use: unusable data becomes a fresh start, points are clamped. */
  sanitize(stored: EnergyState | null, now: number): EnergyState {
    if (!stored || !Number.isFinite(stored.points) || !Number.isFinite(stored.lastRegenAt)) {
      return this.initial(now);
    }
    return {
      points: clamp(Math.floor(stored.points), 0, this.config.maxPoints),
      lastRegenAt: stored.lastRegenAt,
    };
  }

  /** Adds the points recovered since the last update, keeping the leftover time. */
  refresh(state: EnergyState, now: number): EnergyState {
    const { maxPoints, regenIntervalMs } = this.config;

    if (state.points >= maxPoints) {
      return { points: maxPoints, lastRegenAt: now }; // full: no recovery running
    }
    if (now < state.lastRegenAt) {
      // The device clock went backwards: restart the interval instead of freezing recovery.
      return { points: state.points, lastRegenAt: now };
    }

    const gained = Math.floor((now - state.lastRegenAt) / regenIntervalMs);
    if (gained === 0) return state;

    const points = Math.min(maxPoints, state.points + gained);
    return points >= maxPoints
      ? { points, lastRegenAt: now }
      : { points, lastRegenAt: state.lastRegenAt + gained * regenIntervalMs };
  }

  /** Pays for one pull. Throws InsufficientEnergyError when there is not enough. */
  spend(state: EnergyState, now: number): EnergyState {
    const current = this.refresh(state, now);
    const { maxPoints, costPerPull } = this.config;

    if (current.points < costPerPull) throw new InsufficientEnergyError();

    // Spending from full is what starts the recovery clock.
    const wasFull = current.points >= maxPoints;
    return {
      points: current.points - costPerPull,
      lastRegenAt: wasFull ? now : current.lastRegenAt,
    };
  }

  /** Gives back the cost of a pull that did not complete. */
  refund(state: EnergyState, now: number): EnergyState {
    const { maxPoints, costPerPull } = this.config;
    const current = this.refresh(state, now);
    const points = Math.min(maxPoints, current.points + costPerPull);
    return points >= maxPoints ? { points, lastRegenAt: now } : { points, lastRegenAt: current.lastRegenAt };
  }

  status(state: EnergyState, now: number): EnergyStatus {
    const { maxPoints, costPerPull, regenIntervalMs } = this.config;
    const current = this.refresh(state, now);

    const isFull = current.points >= maxPoints;
    const msUntilNextPoint = isFull
      ? null
      : clamp(regenIntervalMs - (now - current.lastRegenAt), 0, regenIntervalMs);

    const missing = Math.max(0, costPerPull - current.points);
    const msUntilCanPull = missing === 0 ? 0 : (msUntilNextPoint ?? 0) + (missing - 1) * regenIntervalMs;

    return {
      points: current.points,
      max: maxPoints,
      costPerPull,
      canPull: missing === 0,
      isFull,
      msUntilNextPoint,
      msUntilCanPull,
    };
  }
}
