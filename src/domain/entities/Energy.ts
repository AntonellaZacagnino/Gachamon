/**
 * What gets saved. Energy is recovered "lazily": instead of a timer adding points,
 * we store the points and the moment the current recovery interval started, and
 * work out the rest whenever someone asks.
 */
export interface EnergyState {
  readonly points: number;
  /** Epoch milliseconds when the running recovery interval started. */
  readonly lastRegenAt: number;
}

/** A snapshot ready to display. */
export interface EnergyStatus {
  readonly points: number;
  readonly max: number;
  readonly costPerPull: number;
  readonly canPull: boolean;
  readonly isFull: boolean;
  /** Time until the next point, or null when the energy is full. */
  readonly msUntilNextPoint: number | null;
  /** 0 when a pull is already possible. */
  readonly msUntilCanPull: number;
}
