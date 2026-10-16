import { PokemonProfile } from '../entities/Pokemon';

export interface PokemonRepository {
  getById(id: number): Promise<PokemonProfile>;
}
