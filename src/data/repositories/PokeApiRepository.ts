import { PokemonProfile } from '../../domain/entities/Pokemon';
import { MAX_POKEMON_ID } from '../../domain/config/gen1Rarities';
import { PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { PokeApiClient } from '../api/PokeApiClient';
import { toPokemonProfile } from '../mappers/PokemonMapper';

export class PokeApiRepository implements PokemonRepository {
  constructor(
    private readonly client: Pick<PokeApiClient, 'getPokemon'>,
    private readonly maxId: number = MAX_POKEMON_ID,
  ) {}

  async getById(id: number): Promise<PokemonProfile> {
    // Second line of defence: never hit the API outside the first 150.
    if (!Number.isInteger(id) || id < 1 || id > this.maxId) {
      throw new RangeError(`Only Pokémon #1-#${this.maxId} are supported (got ${id})`);
    }
    return toPokemonProfile(await this.client.getPokemon(id));
  }
}
