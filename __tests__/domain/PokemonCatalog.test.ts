import { GEN_1_ELEVATED_IDS, MAX_POKEMON_ID } from '../../src/domain/config/gen1Rarities';
import { Rarity } from '../../src/domain/entities/Rarity';
import { PokemonCatalog } from '../../src/domain/services/PokemonCatalog';

const none = { [Rarity.RARE]: [], [Rarity.EPIC]: [], [Rarity.LEGENDARY]: [] };

describe('PokemonCatalog', () => {
  it('puts every id that is not elevated into COMMON', () => {
    const catalog = new PokemonCatalog(5, { ...none, [Rarity.RARE]: [2], [Rarity.LEGENDARY]: [5] });
    expect(catalog.idsByRarity(Rarity.COMMON)).toEqual([1, 3, 4]);
    expect(catalog.idsByRarity(Rarity.RARE)).toEqual([2]);
    expect(catalog.idsByRarity(Rarity.LEGENDARY)).toEqual([5]);
  });

  it('rejects ids outside the allowed range', () => {
    expect(() => new PokemonCatalog(5, { ...none, [Rarity.RARE]: [6] })).toThrow(RangeError);
    expect(() => new PokemonCatalog(5, { ...none, [Rarity.RARE]: [0] })).toThrow(RangeError);
  });

  it('rejects an id assigned to two rarities', () => {
    expect(
      () => new PokemonCatalog(5, { ...none, [Rarity.RARE]: [2], [Rarity.EPIC]: [2] }),
    ).toThrow('more than one rarity');
  });

  describe('gen1()', () => {
    const catalog = PokemonCatalog.gen1();
    const all = Object.values(Rarity).flatMap((rarity) => catalog.idsByRarity(rarity));

    it('covers exactly the first 150 Pokémon, each once', () => {
      expect(all).toHaveLength(MAX_POKEMON_ID);
      expect(new Set(all).size).toBe(MAX_POKEMON_ID);
      expect(Math.min(...all)).toBe(1);
      expect(Math.max(...all)).toBe(MAX_POKEMON_ID);
    });

    it('has a non-empty pool for every rarity', () => {
      Object.values(Rarity).forEach((rarity) =>
        expect(catalog.idsByRarity(rarity).length).toBeGreaterThan(0),
      );
    });

    it('keeps the elevated table as configured', () => {
      expect(catalog.idsByRarity(Rarity.LEGENDARY)).toEqual(GEN_1_ELEVATED_IDS[Rarity.LEGENDARY]);
    });
  });
});

describe('PokemonCatalog lookups', () => {
  const catalog = new PokemonCatalog(5, { ...none, [Rarity.RARE]: [2], [Rarity.LEGENDARY]: [5] });

  it('lists every id in ascending order and reports the total', () => {
    expect(catalog.ids()).toEqual([1, 2, 3, 4, 5]);
    expect(catalog.totalPokemon).toBe(5);
  });

  it('tells the rarity of any id', () => {
    expect(catalog.rarityOf(1)).toBe(Rarity.COMMON);
    expect(catalog.rarityOf(2)).toBe(Rarity.RARE);
    expect(catalog.rarityOf(5)).toBe(Rarity.LEGENDARY);
  });

  it('throws for ids outside the catalog', () => {
    expect(() => catalog.rarityOf(6)).toThrow(RangeError);
    expect(() => catalog.rarityOf(0)).toThrow(RangeError);
  });

  it('is consistent with idsByRarity for the real gen 1 catalog', () => {
    const gen1 = PokemonCatalog.gen1();
    expect(gen1.totalPokemon).toBe(150);
    Object.values(Rarity).forEach((rarity) =>
      gen1.idsByRarity(rarity).forEach((id) => expect(gen1.rarityOf(id)).toBe(rarity)),
    );
  });
});
