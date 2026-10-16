import { Rarity } from '../entities/Rarity';
import { ElevatedRarityIds, GEN_1_ELEVATED_IDS, MAX_POKEMON_ID } from '../config/gen1Rarities';

type RarityPools = Readonly<Record<Rarity, readonly number[]>>;

/** Knows which Pokémon ids belong to which rarity. Pure data, no network. */
export class PokemonCatalog {
  private readonly pools: RarityPools;
  private readonly rarityById: ReadonlyMap<number, Rarity>;
  private readonly sortedIds: readonly number[];

  constructor(totalPokemon: number, elevatedIds: ElevatedRarityIds) {
    this.pools = PokemonCatalog.buildPools(totalPokemon, elevatedIds);

    const rarityById = new Map<number, Rarity>();
    for (const rarity of Object.values(Rarity)) {
      for (const id of this.pools[rarity]) rarityById.set(id, rarity);
    }
    this.rarityById = rarityById;
    this.sortedIds = [...rarityById.keys()].sort((a, b) => a - b);
  }

  static gen1(): PokemonCatalog {
    return new PokemonCatalog(MAX_POKEMON_ID, GEN_1_ELEVATED_IDS);
  }

  get totalPokemon(): number {
    return this.sortedIds.length;
  }

  /** Every id in the catalog, ascending. */
  ids(): readonly number[] {
    return this.sortedIds;
  }

  idsByRarity(rarity: Rarity): readonly number[] {
    return this.pools[rarity];
  }

  rarityOf(id: number): Rarity {
    const rarity = this.rarityById.get(id);
    if (rarity === undefined) {
      throw new RangeError(`Pokémon id ${id} is not in the catalog`);
    }
    return rarity;
  }

  private static buildPools(total: number, elevated: ElevatedRarityIds): RarityPools {
    const taken = new Set<number>();

    for (const id of Object.values(elevated).flat()) {
      if (!Number.isInteger(id) || id < 1 || id > total) {
        throw new RangeError(`Pokémon id ${id} is outside 1-${total}`);
      }
      if (taken.has(id)) {
        throw new Error(`Pokémon id ${id} is assigned to more than one rarity`);
      }
      taken.add(id);
    }

    const common = Array.from({ length: total }, (_, index) => index + 1).filter(
      (id) => !taken.has(id),
    );
    return { [Rarity.COMMON]: common, ...elevated };
  }
}
