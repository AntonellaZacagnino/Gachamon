import { Pokemon } from './Pokemon';
import { Rarity } from './Rarity';

export interface PullResult {
  readonly pokemon: Pokemon;
  readonly rarity: Rarity;
  readonly isNew: boolean;
}
