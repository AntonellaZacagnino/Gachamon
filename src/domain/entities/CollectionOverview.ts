import { Pokemon } from './Pokemon';
import { Rarity } from './Rarity';

/** One slot of the Pokédex: the Pokémon is null while it has not been caught. */
export interface CollectionEntry {
  readonly id: number;
  readonly rarity: Rarity;
  readonly pokemon: Pokemon | null;
}

export interface RarityProgress {
  readonly owned: number;
  readonly total: number;
}

export interface CollectionOverview {
  /** One entry per Pokémon in the catalog, ordered by id. */
  readonly entries: readonly CollectionEntry[];
  readonly owned: number;
  readonly total: number;
  readonly byRarity: Readonly<Record<Rarity, RarityProgress>>;
}
