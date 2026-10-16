import { Rarity } from './Rarity';

/** What we learn from the outside world about a Pokémon (no game rules). */
export interface PokemonProfile {
  readonly id: number;
  readonly name: string;
  /** Full-size artwork URL, displayed when the Pokémon is revealed. */
  readonly spriteUrl: string;
}

/** A Pokémon as the game sees it: profile + the rarity it was pulled at. */
export interface Pokemon extends PokemonProfile {
  readonly rarity: Rarity;
}
