import { EnergyState } from '../../src/domain/entities/Energy';
import { InsufficientEnergyError } from '../../src/domain/errors/InsufficientEnergyError';
import { EnergyRepository } from '../../src/domain/repositories/EnergyRepository';
import { Clock } from '../../src/domain/services/Clock';
import { EnergyRules } from '../../src/domain/services/EnergyRules';
import { EnergyService } from '../../src/domain/services/EnergyService';

const MIN = 60 * 1000;
const T0 = 1_700_000_000_000;

class FakeClock implements Clock {
  constructor(public time = T0) {}
  now() { return this.time; }
  advance(ms: number) { this.time += ms; }
}

class MemoryEnergyRepository implements EnergyRepository {
  saved: EnergyState | null = null;
  failSaving = false;
  failLoading = false;
  saves = 0;
  async load() {
    if (this.failLoading) throw new Error('storage down');
    return this.saved;
  }
  async save(state: EnergyState) {
    if (this.failSaving) throw new Error('disk full');
    this.saved = state;
    this.saves += 1;
  }
}

const setup = (repository = new MemoryEnergyRepository(), clock = new FakeClock()) => ({
  repository,
  clock,
  service: new EnergyService(new EnergyRules(), repository, clock),
});

describe('EnergyService', () => {
  it('has no status until it has loaded, then starts a new player at 20', async () => {
    const { service } = setup();
    expect(service.status()).toBeNull();

    await service.load();
    expect(service.status()?.points).toBe(20);
  });

  it('spends 2 points per pull and saves them', async () => {
    const { service, repository } = setup();

    const status = await service.spend();

    expect(status.points).toBe(18);
    expect(repository.saved?.points).toBe(18);
  });

  it('refuses the 11th pull in a row, and leaves the energy untouched', async () => {
    const { service } = setup();
    for (let i = 0; i < 10; i++) await service.spend();

    await expect(service.spend()).rejects.toBeInstanceOf(InsufficientEnergyError);
    expect(service.status()?.points).toBe(0);
  });

  it('cannot be tricked by tapping many times at once', async () => {
    const { service } = setup();

    const results = await Promise.all(
      Array.from({ length: 14 }, () => service.spend().then(() => 'ok', () => 'refused')),
    );

    expect(results.filter((result) => result === 'ok')).toHaveLength(10);
    expect(results.filter((result) => result === 'refused')).toHaveLength(4);
    expect(service.status()?.points).toBe(0);
  });

  it('recovers 1 point every 5 minutes of real time', async () => {
    const { service, clock } = setup();
    for (let i = 0; i < 10; i++) await service.spend(); // empty, timer started at T0

    expect(service.status()?.points).toBe(0);
    clock.advance(5 * MIN);
    expect(service.status()?.points).toBe(1);
    expect(service.status()?.canPull).toBe(false);
    clock.advance(5 * MIN);
    expect(service.status()?.canPull).toBe(true);

    await expect(service.spend()).resolves.toMatchObject({ points: 0 });
  });

  it('keeps recovering while the app is closed: a new instance continues from what was saved', async () => {
    const first = setup();
    for (let i = 0; i < 10; i++) await first.service.spend();

    const clock = new FakeClock(T0 + 25 * MIN); // the app is reopened 25 minutes later
    const reopened = new EnergyService(new EnergyRules(), first.repository, clock);
    await reopened.load();

    expect(reopened.status()?.points).toBe(5);
  });

  it('refunds a pull that failed', async () => {
    const { service } = setup();
    await service.spend();
    await service.refund();
    expect(service.status()?.points).toBe(20);
  });

  it('tells subscribers about every change, and stops after unsubscribing', async () => {
    const { service } = setup();
    await service.load();
    const listener = jest.fn();
    const unsubscribe = service.subscribe(listener);

    await service.spend();
    await service.refund();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    await service.spend();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('starts fresh when the saved data is unreadable', async () => {
    const repository = new MemoryEnergyRepository();
    repository.failLoading = true;
    const { service } = setup(repository);

    await service.load();
    expect(service.status()?.points).toBe(20);
  });

  it('keeps working in memory if saving fails', async () => {
    const repository = new MemoryEnergyRepository();
    repository.failSaving = true;
    const { service } = setup(repository);

    await expect(service.spend()).resolves.toMatchObject({ points: 18 });
    expect(service.status()?.points).toBe(18);
  });

  it('loads only once, however many callers ask', async () => {
    const { service, repository } = setup();
    const load = jest.spyOn(repository, 'load');

    await Promise.all([service.load(), service.load(), service.spend()]);

    expect(load).toHaveBeenCalledTimes(1);
  });
});
