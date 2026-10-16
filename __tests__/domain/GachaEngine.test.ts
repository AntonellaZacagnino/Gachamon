import { Rarity } from '../../src/domain/entities/Rarity';
import { DropRateTable } from '../../src/domain/services/DropRateTable';
import { GachaEngine } from '../../src/domain/services/GachaEngine';
import { RandomSource } from '../../src/domain/services/RandomSource';

class SequenceRandom implements RandomSource {
  private index = 0;
  constructor(private readonly values: number[]) {}
  next(): number {
    return this.values[this.index++ % this.values.length];
  }
}

const engineWith = (...rolls: number[]) =>
  new GachaEngine(DropRateTable.default(), new SequenceRandom(rolls));

describe('GachaEngine.rollRarity', () => {
  it.each([
    [0.0, Rarity.COMMON],
    [0.69, Rarity.COMMON],
    [0.7, Rarity.RARE], // boundary belongs to the next bucket
    [0.85, Rarity.RARE],
    [0.92, Rarity.EPIC],
    [0.99, Rarity.LEGENDARY],
  ])('roll %p returns %p', (roll, expected) => {
    expect(engineWith(roll).rollRarity()).toBe(expected);
  });

  it('falls back to the last rarity when the roll exceeds the sum', () => {
    expect(engineWith(0.9999999999).rollRarity()).toBe(Rarity.LEGENDARY);
  });
});

describe('GachaEngine.pickOne', () => {
  it('maps the roll to an index', () => {
    expect(engineWith(0.0).pickOne(['a', 'b', 'c'])).toBe('a');
    expect(engineWith(0.5).pickOne(['a', 'b', 'c'])).toBe('b');
    expect(engineWith(0.99).pickOne(['a', 'b', 'c'])).toBe('c');
  });

  it('throws on an empty pool', () => {
    expect(() => engineWith(0.5).pickOne([])).toThrow('empty pool');
  });
});

describe('DropRateTable', () => {
  it('rejects rates that do not sum to 1', () => {
    expect(
      () =>
        new DropRateTable({
          [Rarity.COMMON]: 0.5,
          [Rarity.RARE]: 0.2,
          [Rarity.EPIC]: 0.1,
          [Rarity.LEGENDARY]: 0.1,
        }),
    ).toThrow('sum to 1');
  });

  it('rejects negative rates', () => {
    expect(
      () =>
        new DropRateTable({
          [Rarity.COMMON]: 1.1,
          [Rarity.RARE]: -0.1,
          [Rarity.EPIC]: 0,
          [Rarity.LEGENDARY]: 0,
        }),
    ).toThrow('negative');
  });
});
