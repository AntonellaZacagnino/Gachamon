import { Rarity } from '../../domain/entities/Rarity';

export interface HoloStyle {
  /** 0 = plain card, 1 = full holographic foil. */
  readonly intensity: number;
  readonly shine: boolean;
  readonly sparkleCount: number;
}

/** Higher rarity, more spectacle. COMMON is a plain (but still tilting) card. */
const HOLO_STYLES: Readonly<Record<Rarity, HoloStyle>> = {
  [Rarity.COMMON]: { intensity: 0, shine: false, sparkleCount: 0 },
  [Rarity.RARE]: { intensity: 0.35, shine: true, sparkleCount: 3 },
  [Rarity.EPIC]: { intensity: 0.65, shine: true, sparkleCount: 6 },
  [Rarity.LEGENDARY]: { intensity: 1, shine: true, sparkleCount: 10 },
};

export const holoStyleFor = (rarity: Rarity): HoloStyle => HOLO_STYLES[rarity];

/** Parallax settings. Depth = pixels a layer moves at full tilt; the sign sets direction. */
export const PARALLAX = {
  maxRotationDeg: 12,
  foilDepth: -8, // background layer moves against the tilt
  pokemonDepth: 14,
  sparkleBaseDepth: 20,
  sparkleDepthStep: 8,
} as const;

/** Fixed sparkle positions (percent of the card), so they don't jump between renders. */
export const SPARKLE_SPOTS: ReadonlyArray<{ left: number; top: number; size: number }> = [
  { left: 12, top: 10, size: 18 },
  { left: 78, top: 14, size: 14 },
  { left: 22, top: 46, size: 12 },
  { left: 84, top: 40, size: 20 },
  { left: 8, top: 66, size: 14 },
  { left: 68, top: 62, size: 12 },
  { left: 46, top: 8, size: 10 },
  { left: 90, top: 70, size: 16 },
  { left: 36, top: 56, size: 10 },
  { left: 58, top: 30, size: 12 },
];
