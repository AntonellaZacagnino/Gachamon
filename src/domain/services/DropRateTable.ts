import { Rarity } from '../entities/Rarity';

export type DropRates = Readonly<Record<Rarity, number>>;

const TOLERANCE = 1e-9;

export class DropRateTable {
  constructor(private readonly rates: DropRates) {
    this.assertValid();
  }

  static default(): DropRateTable {
    return new DropRateTable({
      [Rarity.COMMON]: 0.7,
      [Rarity.RARE]: 0.2,
      [Rarity.EPIC]: 0.08,
      [Rarity.LEGENDARY]: 0.02,
    });
  }

  entries(): ReadonlyArray<readonly [Rarity, number]> {
    return Object.entries(this.rates) as Array<[Rarity, number]>;
  }

  private assertValid(): void {
    const values = Object.values(this.rates);
    if (values.some((rate) => rate < 0)) {
      throw new Error('Drop rates cannot be negative');
    }
    const total = values.reduce((sum, rate) => sum + rate, 0);
    if (Math.abs(total - 1) > TOLERANCE) {
      throw new Error(`Drop rates must sum to 1 (got ${total})`);
    }
  }
}
