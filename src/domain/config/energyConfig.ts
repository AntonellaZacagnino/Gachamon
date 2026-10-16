export interface EnergyConfig {
  readonly maxPoints: number;
  readonly costPerPull: number;
  /** One point is recovered every time this much time passes. */
  readonly regenIntervalMs: number;
}

export const DEFAULT_ENERGY_CONFIG: EnergyConfig = {
  maxPoints: 20,
  costPerPull: 2,
  regenIntervalMs: 5 * 60 * 1000,
};
