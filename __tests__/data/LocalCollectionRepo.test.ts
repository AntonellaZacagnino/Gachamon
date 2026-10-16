import { Pokemon } from '../../src/domain/entities/Pokemon';
import { Rarity } from '../../src/domain/entities/Rarity';
import { LocalCollectionRepo } from '../../src/data/repositories/LocalCollectionRepo';
import { KeyValueStorage } from '../../src/data/storage/KeyValueStorage';

class FakeStorage implements KeyValueStorage {
  readonly data = new Map<string, string>();
  async getItem(key: string) { return this.data.get(key) ?? null; }
  async setItem(key: string, value: string) { this.data.set(key, value); }
}

const pikachu: Pokemon = { id: 25, name: 'pikachu', spriteUrl: 'x', rarity: Rarity.RARE };

describe('LocalCollectionRepo', () => {
  it('stores and retrieves Pokémon', async () => {
    const repo = new LocalCollectionRepo(new FakeStorage());
    expect(await repo.has(25)).toBe(false);

    await repo.add(pikachu);

    expect(await repo.has(25)).toBe(true);
    expect(await repo.getAll()).toEqual([pikachu]);
  });

  it('does not duplicate a Pokémon added twice', async () => {
    const repo = new LocalCollectionRepo(new FakeStorage());
    await repo.add(pikachu);
    await repo.add(pikachu);
    expect(await repo.getAll()).toHaveLength(1);
  });

  it('persists across instances sharing the same storage', async () => {
    const storage = new FakeStorage();
    await new LocalCollectionRepo(storage).add(pikachu);

    expect(await new LocalCollectionRepo(storage).getAll()).toEqual([pikachu]);
  });

  it('recovers from corrupted stored data', async () => {
    const storage = new FakeStorage();
    storage.data.set('pokemon-gacha:collection:v1', '{not json');

    expect(await new LocalCollectionRepo(storage).getAll()).toEqual([]);
  });
});
