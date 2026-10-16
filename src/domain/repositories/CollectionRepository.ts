import { Pokemon } from '../entities/Pokemon';

export interface CollectionRepository {
  has(pokemonId: number): Promise<boolean>;
  add(pokemon: Pokemon): Promise<void>;
  getAll(): Promise<Pokemon[]>;
}
