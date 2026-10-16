import { Rarity } from '../../domain/entities/Rarity';

export const RARITY_COLORS: Readonly<Record<Rarity, string>> = {
  [Rarity.COMMON]: '#9aa5b1',
  [Rarity.RARE]: '#3a86ff',
  [Rarity.EPIC]: '#8338ec',
  [Rarity.LEGENDARY]: '#ffb703',
};

/** Light colour used before any pull has happened. */
export const DEFAULT_ACCENT_COLOR = '#ffffff';
