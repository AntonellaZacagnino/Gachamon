import { CollectionEntry } from '../../domain/entities/CollectionOverview';
import { Rarity } from '../../domain/entities/Rarity';

export type RarityFilter = Rarity | 'ALL';

export const RARITY_FILTERS: readonly RarityFilter[] = ['ALL', ...Object.values(Rarity)];

export function filterEntries(
  entries: readonly CollectionEntry[],
  filter: RarityFilter,
  ownedOnly: boolean,
): CollectionEntry[] {
  return entries.filter(
    (entry) =>
      (filter === 'ALL' || entry.rarity === filter) && (!ownedOnly || entry.pokemon !== null),
  );
}

/** Whole-number percentage; 0 when there is nothing to complete. */
export function completionPercent(owned: number, total: number): number {
  return total > 0 ? Math.round((owned / total) * 100) : 0;
}
