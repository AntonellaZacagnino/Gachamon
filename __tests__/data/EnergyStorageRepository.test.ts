import { EnergyStorageRepository } from '../../src/data/repositories/EnergyStorageRepository';
import { KeyValueStorage } from '../../src/data/storage/KeyValueStorage';

class FakeStorage implements KeyValueStorage {
  readonly data = new Map<string, string>();
  async getItem(key: string) { return this.data.get(key) ?? null; }
  async setItem(key: string, value: string) { this.data.set(key, value); }
}

const KEY = 'pokemon-gacha:energy:v1';

describe('EnergyStorageRepository', () => {
  it('returns null when nothing has been saved', async () => {
    expect(await new EnergyStorageRepository(new FakeStorage()).load()).toBeNull();
  });

  it('saves and loads the state', async () => {
    const repo = new EnergyStorageRepository(new FakeStorage());
    await repo.save({ points: 12, lastRegenAt: 1234 });
    expect(await repo.load()).toEqual({ points: 12, lastRegenAt: 1234 });
  });

  it('survives a restart (new instance, same storage)', async () => {
    const storage = new FakeStorage();
    await new EnergyStorageRepository(storage).save({ points: 3, lastRegenAt: 99 });
    expect(await new EnergyStorageRepository(storage).load()).toEqual({ points: 3, lastRegenAt: 99 });
  });

  it.each(['{not json', '"hello"', 'null', '{"points":"5","lastRegenAt":1}', '{"points":5}'])(
    'treats broken data %p as "nothing saved"',
    async (raw) => {
      const storage = new FakeStorage();
      storage.data.set(KEY, raw);
      expect(await new EnergyStorageRepository(storage).load()).toBeNull();
    },
  );
});
