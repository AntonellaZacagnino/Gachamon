import { Pokemon } from '../../src/domain/entities/Pokemon';
import { Rarity } from '../../src/domain/entities/Rarity';
import { CollectionRepository } from '../../src/domain/repositories/CollectionRepository';
import { buildCollectionOverview } from '../../src/domain/services/buildCollectionOverview';
import { PokemonCatalog } from '../../src/domain/services/PokemonCatalog';
import { GetCollectionUseCase } from '../../src/domain/usecases/GetCollectionUseCase';

// 5 Pokémon: #1 #3 #4 COMMON, #2 RARE, #5 LEGENDARY
const catalog = new PokemonCatalog(5, {
  [Rarity.RARE]: [2],
  [Rarity.EPIC]: [],
  [Rarity.LEGENDARY]: [5],
});

const pokemon = (id: number): Pokemon => ({
  id,
  name: `pokemon-${id}`,
  spriteUrl: `https://img/${id}.png`,
  rarity: catalog.rarityOf(id),
});

describe('buildCollectionOverview', () => {
  it('has one entry per catalog Pokémon, in id order, all missing when nothing is owned', () => {
    const overview = buildCollectionOverview(catalog, []);

    expect(overview.entries.map((entry) => entry.id)).toEqual([1, 2, 3, 4, 5]);
    expect(overview.entries.every((entry) => entry.pokemon === null)).toBe(true);
    expect(overview.owned).toBe(0);
    expect(overview.total).toBe(5);
  });

  it('fills the slots of the Pokémon that are owned', () => {
    const overview = buildCollectionOverview(catalog, [pokemon(2), pokemon(4)]);

    expect(overview.entries[1].pokemon).toEqual(pokemon(2));
    expect(overview.entries[3].pokemon).toEqual(pokemon(4));
    expect(overview.entries[0].pokemon).toBeNull();
    expect(overview.owned).toBe(2);
  });

  it('takes the rarity from the catalog, for owned and missing slots alike', () => {
    const overview = buildCollectionOverview(catalog, [pokemon(2)]);
    expect(overview.entries.map((entry) => entry.rarity)).toEqual([
      Rarity.COMMON, Rarity.RARE, Rarity.COMMON, Rarity.COMMON, Rarity.LEGENDARY,
    ]);
  });

  it('counts progress per rarity', () => {
    const overview = buildCollectionOverview(catalog, [pokemon(1), pokemon(2), pokemon(5)]);

    expect(overview.byRarity[Rarity.COMMON]).toEqual({ owned: 1, total: 3 });
    expect(overview.byRarity[Rarity.RARE]).toEqual({ owned: 1, total: 1 });
    expect(overview.byRarity[Rarity.EPIC]).toEqual({ owned: 0, total: 0 });
    expect(overview.byRarity[Rarity.LEGENDARY]).toEqual({ owned: 1, total: 1 });
  });

  it('ignores Pokémon that are not in the catalog (e.g. stale saved data)', () => {
    const overview = buildCollectionOverview(catalog, [pokemon(1), { ...pokemon(1), id: 99 }]);
    expect(overview.owned).toBe(1);
    expect(overview.entries).toHaveLength(5);
  });

  it('shows the full gen 1 Pokédex with 150 slots', () => {
    const overview = buildCollectionOverview(PokemonCatalog.gen1(), []);
    expect(overview.total).toBe(150);
    const totals = Object.values(overview.byRarity).reduce((sum, rarity) => sum + rarity.total, 0);
    expect(totals).toBe(150);
  });
});

describe('GetCollectionUseCase', () => {
  it('builds the overview from what the repository holds', async () => {
    const repository: CollectionRepository = {
      has: async () => false,
      add: async () => undefined,
      getAll: async () => [pokemon(3), pokemon(5)],
    };

    const overview = await new GetCollectionUseCase(catalog, repository).execute();

    expect(overview.owned).toBe(2);
    expect(overview.entries[2].pokemon).toEqual(pokemon(3));
    expect(overview.byRarity[Rarity.LEGENDARY].owned).toBe(1);
  });
});
