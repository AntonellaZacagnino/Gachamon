import { useEffect, useState } from 'react';
import { EnergyStatus } from '../../domain/entities/Energy';
import { EnergyService } from '../../domain/services/EnergyService';

export type EnergyView = Pick<EnergyService, 'status' | 'load' | 'subscribe'>;

const TICK_MS = 1000;

/**
 * Live energy for the UI: updates instantly when energy is spent or refunded, and ticks
 * every second while it is not full so the countdown (and recovered points) stay current.
 */
export function useEnergy(energy: EnergyView): EnergyStatus | null {
  const [status, setStatus] = useState<EnergyStatus | null>(() => energy.status());

  useEffect(() => {
    const refresh = () => setStatus(energy.status());
    const unsubscribe = energy.subscribe(refresh);
    void energy.load().then(refresh);
    return unsubscribe;
  }, [energy]);

  const recovering = status !== null && !status.isFull;
  useEffect(() => {
    if (!recovering) return;
    const timer = setInterval(() => setStatus(energy.status()), TICK_MS);
    return () => clearInterval(timer);
  }, [recovering, energy]);

  return status;
}
