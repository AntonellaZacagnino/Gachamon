import { CollectionEntry, CollectionOverview, RarityProgress } from '../entities/CollectionOverview';
import { Pokemon } from '../entities/Pokemon';
import { Rarity } from '../entities/Rarity';
import { PokemonCatalog } from './PokemonCatalog';

/**
 * Combines the static catalog with what the player owns. Pokémon that are not in the
 * catalog (e.g. left over from old saved data) are ignored.
 */
export function buildCollectionOverview(
  catalog: PokemonCatalog,
  owned: readonly Pokemon[],
): CollectionOverview {
  const ownedById = new Map(owned.map((pokemon) => [pokemon.id, pokemon]));

  const entries: CollectionEntry[] = catalog.ids().map((id) => ({
    id,
    rarity: catalog.rarityOf(id),
    pokemon: ownedById.get(id) ?? null,
  }));

  const counters = Object.fromEntries(
    Object.values(Rarity).map((rarity) => [rarity, { owned: 0, total: 0 }]),
  ) as Record<Rarity, { owned: number; total: number }>;

  for (const entry of entries) {
    counters[entry.rarity].total += 1;
    if (entry.pokemon) counters[entry.rarity].owned += 1;
  }

  const byRarity: Readonly<Record<Rarity, RarityProgress>> = counters;
  return {
    entries,
    owned: entries.filter((entry) => entry.pokemon !== null).length,
    total: entries.length,
    byRarity,
  };
}
