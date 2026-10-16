import { EnergyState } from '../entities/Energy';

export interface EnergyRepository {
  /** null when nothing valid has been saved yet. */
  load(): Promise<EnergyState | null>;
  save(state: EnergyState): Promise<void>;
}
