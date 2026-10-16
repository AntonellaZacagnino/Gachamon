import { Rarity } from '../entities/Rarity';
import { DropRateTable } from './DropRateTable';
import { RandomSource } from './RandomSource';

export class GachaEngine {
  constructor(
    private readonly dropRates: DropRateTable,
    private readonly random: RandomSource,
  ) {}

  rollRarity(): Rarity {
    const roll = this.random.next();
    const entries = this.dropRates.entries();
    let cumulative = 0;

    for (const [rarity, probability] of entries) {
      cumulative += probability;
      if (roll < cumulative) return rarity;
    }
    // Floating point safety net: the roll landed past the accumulated sum.
    return entries[entries.length - 1][0];
  }

  pickOne<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from an empty pool');
    }
    const index = Math.floor(this.random.next() * items.length);
    return items[Math.min(index, items.length - 1)];
  }
}
