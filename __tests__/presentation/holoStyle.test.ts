import { Rarity } from '../../src/domain/entities/Rarity';
import { holoStyleFor, SPARKLE_SPOTS } from '../../src/presentation/effects/holoStyle';

const ORDER = [Rarity.COMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY];

describe('holoStyleFor', () => {
  it('gives COMMON a plain card without foil, shine or sparkles', () => {
    expect(holoStyleFor(Rarity.COMMON)).toEqual({ intensity: 0, shine: false, sparkleCount: 0 });
  });

  it('increases intensity and sparkles with every rarity step', () => {
    ORDER.slice(1).forEach((rarity, index) => {
      const previous = holoStyleFor(ORDER[index]);
      const current = holoStyleFor(rarity);
      expect(current.intensity).toBeGreaterThan(previous.intensity);
      expect(current.sparkleCount).toBeGreaterThan(previous.sparkleCount);
    });
  });

  it('never asks for more sparkles than there are positions', () => {
    ORDER.forEach((rarity) =>
      expect(holoStyleFor(rarity).sparkleCount).toBeLessThanOrEqual(SPARKLE_SPOTS.length),
    );
  });

  it('keeps intensity within [0, 1]', () => {
    ORDER.forEach((rarity) => {
      const { intensity } = holoStyleFor(rarity);
      expect(intensity).toBeGreaterThanOrEqual(0);
      expect(intensity).toBeLessThanOrEqual(1);
    });
  });
});
