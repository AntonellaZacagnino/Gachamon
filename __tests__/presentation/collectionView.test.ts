import { CollectionEntry } from '../../src/domain/entities/CollectionOverview';
import { Pokemon } from '../../src/domain/entities/Pokemon';
import { Rarity } from '../../src/domain/entities/Rarity';
import {
  completionPercent,
  filterEntries,
  RARITY_FILTERS,
} from '../../src/presentation/collection/collectionView';

const caught = (id: number, rarity: Rarity): Pokemon => ({ id, name: `p${id}`, spriteUrl: 'x', rarity });
const entry = (id: number, rarity: Rarity, owned: boolean): CollectionEntry => ({
  id,
  rarity,
  pokemon: owned ? caught(id, rarity) : null,
});

const entries = [
  entry(1, Rarity.COMMON, true),
  entry(2, Rarity.COMMON, false),
  entry(3, Rarity.RARE, true),
  entry(4, Rarity.RARE, false),
  entry(5, Rarity.LEGENDARY, false),
];

describe('filterEntries', () => {
  it('returns everything for "ALL" without the owned filter', () => {
    expect(filterEntries(entries, 'ALL', false)).toHaveLength(5);
  });

  it('filters by rarity, keeping the original order', () => {
    expect(filterEntries(entries, Rarity.RARE, false).map((e) => e.id)).toEqual([3, 4]);
  });

  it('keeps only caught Pokémon when asked', () => {
    expect(filterEntries(entries, 'ALL', true).map((e) => e.id)).toEqual([1, 3]);
  });

  it('combines rarity and caught filters', () => {
    expect(filterEntries(entries, Rarity.COMMON, true).map((e) => e.id)).toEqual([1]);
    expect(filterEntries(entries, Rarity.LEGENDARY, true)).toEqual([]);
  });

  it('does not modify the input', () => {
    const copy = [...entries];
    filterEntries(entries, Rarity.RARE, true);
    expect(entries).toEqual(copy);
  });
});

describe('completionPercent', () => {
  it('rounds to a whole number', () => {
    expect(completionPercent(1, 3)).toBe(33);
    expect(completionPercent(2, 3)).toBe(67);
    expect(completionPercent(150, 150)).toBe(100);
  });

  it('is 0 with nothing to complete', () => {
    expect(completionPercent(0, 0)).toBe(0);
    expect(completionPercent(0, 150)).toBe(0);
  });
});

describe('RARITY_FILTERS', () => {
  it('starts with ALL and then lists every rarity once', () => {
    expect(RARITY_FILTERS[0]).toBe('ALL');
    expect(RARITY_FILTERS.slice(1)).toEqual(Object.values(Rarity));
  });
});
