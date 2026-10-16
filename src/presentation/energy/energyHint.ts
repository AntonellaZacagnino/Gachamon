import { EnergyStatus } from '../../domain/entities/Energy';
import { formatCountdown } from '../../shared/utils/formatDuration';

/** The one-line message under the energy bar. */
export function energyHint(status: EnergyStatus): string {
  if (!status.canPull) {
    return `Not enough energy · next pull in ${formatCountdown(status.msUntilCanPull)}`;
  }
  if (status.msUntilNextPoint !== null) {
    return `+1 energy in ${formatCountdown(status.msUntilNextPoint)}`;
  }
  return 'Energy full';
}
