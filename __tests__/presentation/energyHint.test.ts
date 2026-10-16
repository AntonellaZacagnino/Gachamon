import { EnergyStatus } from '../../src/domain/entities/Energy';
import { energyHint } from '../../src/presentation/energy/energyHint';

const MIN = 60 * 1000;
const status = (overrides: Partial<EnergyStatus>): EnergyStatus => ({
  points: 10, max: 20, costPerPull: 2, canPull: true, isFull: false, msUntilNextPoint: 4 * MIN + 32_000, msUntilCanPull: 0,
  ...overrides,
});

describe('energyHint', () => {
  it('shows the countdown to the next point while recovering', () => {
    expect(energyHint(status({}))).toBe('+1 energy in 4:32');
  });

  it('says the energy is full when there is nothing to recover', () => {
    expect(energyHint(status({ points: 20, isFull: true, msUntilNextPoint: null }))).toBe('Energy full');
  });

  it('explains how long to wait when there is not enough energy', () => {
    expect(
      energyHint(status({ points: 0, canPull: false, msUntilNextPoint: 5 * MIN, msUntilCanPull: 10 * MIN })),
    ).toBe('Not enough energy · next pull in 10:00');
  });
});
