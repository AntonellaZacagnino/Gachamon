import { Rarity } from '../entities/Rarity';

/** The machine only contains the original 150 Pokémon. */
export const MAX_POKEMON_ID = 150;

export type ElevatedRarity = Exclude<Rarity, Rarity.COMMON>;
export type ElevatedRarityIds = Readonly<Record<ElevatedRarity, readonly number[]>>;

/**
 * Game-design decision, not API data: tweak freely.
 * Every id from 1 to MAX_POKEMON_ID that is NOT listed here is COMMON.
 */
export const GEN_1_ELEVATED_IDS: ElevatedRarityIds = {
  [Rarity.RARE]: [2, 5, 8, 25, 26, 38, 133, 134, 135, 136, 137, 142],
  [Rarity.EPIC]: [3, 6, 9, 59, 65, 68, 76, 94, 130, 131, 143, 149],
  [Rarity.LEGENDARY]: [144, 145, 146, 150],
};
