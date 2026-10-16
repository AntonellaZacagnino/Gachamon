import { EnergyStatus } from '../../src/domain/entities/Energy';
import { Pokemon, PokemonProfile } from '../../src/domain/entities/Pokemon';
import { Rarity } from '../../src/domain/entities/Rarity';
import { InsufficientEnergyError } from '../../src/domain/errors/InsufficientEnergyError';
import { CollectionRepository } from '../../src/domain/repositories/CollectionRepository';
import { PokemonRepository } from '../../src/domain/repositories/PokemonRepository';
import { DropRateTable } from '../../src/domain/services/DropRateTable';
import { EnergyPort } from '../../src/domain/services/EnergyService';
import { GachaEngine } from '../../src/domain/services/GachaEngine';
import { PokemonCatalog } from '../../src/domain/services/PokemonCatalog';
import { PullGachaUseCase } from '../../src/domain/usecases/PullGachaUseCase';

// Catalog of 3 Pokémon: #1 and #3 are COMMON, #2 is RARE.
const catalog = new PokemonCatalog(3, {
  [Rarity.RARE]: [2],
  [Rarity.EPIC]: [],
  [Rarity.LEGENDARY]: [],
});

const STATUS: EnergyStatus = {
  points: 18, max: 20, costPerPull: 2, canPull: true, isFull: false, msUntilNextPoint: 1000, msUntilCanPull: 0,
};

class FakePokemonRepository implements PokemonRepository {
  readonly requestedIds: number[] = [];
  async getById(id: number): Promise<PokemonProfile> {
    this.requestedIds.push(id);
    return { id, name: `pokemon-${id}`, spriteUrl: `https://img/${id}.png` };
  }
}

class FailingPokemonRepository implements PokemonRepository {
  async getById(): Promise<PokemonProfile> {
    throw new Error('network down');
  }
}

class InMemoryCollection implements CollectionRepository {
  private readonly items = new Map<number, Pokemon>();
  async has(id: number) { return this.items.has(id); }
  async add(p: Pokemon) { this.items.set(p.id, p); }
  async getAll() { return [...this.items.values()]; }
}

class FakeEnergy implements EnergyPort {
  spent = 0;
  refunded = 0;
  enough = true;
  async spend() {
    if (!this.enough) throw new InsufficientEnergyError();
    this.spent += 1;
    return STATUS;
  }
  async refund() {
    this.refunded += 1;
  }
}

const setup = (pokemonRepository: PokemonRepository = new FakePokemonRepository()) => {
  const collection = new InMemoryCollection();
  const energy = new FakeEnergy();
  const useCase = new PullGachaUseCase(
    new GachaEngine(DropRateTable.default(), { next: () => 0 }),
    catalog,
    pokemonRepository,
    collection,
    energy,
  );
  return { useCase, pokemonRepository, collection, energy };
};

describe('PullGachaUseCase', () => {
  it('rolls a rarity, picks an id from its pool and attaches the rarity', async () => {
    const { useCase } = setup();

    const result = await useCase.execute();

    expect(result.rarity).toBe(Rarity.COMMON);
    expect(result.pokemon).toEqual({
      id: 1,
      name: 'pokemon-1',
      spriteUrl: 'https://img/1.png',
      rarity: Rarity.COMMON,
    });
  });

  it('requests exactly one Pokémon from the repository per pull', async () => {
    const repository = new FakePokemonRepository();
    const { useCase } = setup(repository);
    await useCase.execute();
    expect(repository.requestedIds).toEqual([1]);
  });

  it('flags the first pull as new and the second as a duplicate', async () => {
    const { useCase } = setup();
    expect((await useCase.execute()).isNew).toBe(true);
    expect((await useCase.execute()).isNew).toBe(false);
  });

  it('stores the pulled Pokémon in the collection', async () => {
    const { useCase, collection } = setup();
    const { pokemon } = await useCase.execute();
    expect(await collection.getAll()).toEqual([pokemon]);
  });
});

describe('PullGachaUseCase and energy', () => {
  it('spends energy once per pull, and does not refund a successful pull', async () => {
    const { useCase, energy } = setup();

    await useCase.execute();
    await useCase.execute();

    expect(energy.spent).toBe(2);
    expect(energy.refunded).toBe(0);
  });

  it('does nothing at all when there is not enough energy', async () => {
    const repository = new FakePokemonRepository();
    const { useCase, energy, collection } = setup(repository);
    energy.enough = false;

    await expect(useCase.execute()).rejects.toBeInstanceOf(InsufficientEnergyError);

    expect(repository.requestedIds).toEqual([]);
    expect(await collection.getAll()).toEqual([]);
    expect(energy.refunded).toBe(0); // nothing was spent, so nothing to give back
  });

  it('refunds the energy when the pull fails (e.g. no network), and saves nothing', async () => {
    const { useCase, energy, collection } = setup(new FailingPokemonRepository());

    await expect(useCase.execute()).rejects.toThrow('network down');

    expect(energy.spent).toBe(1);
    expect(energy.refunded).toBe(1);
    expect(await collection.getAll()).toEqual([]);
  });
});
