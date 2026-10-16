import { PokemonProfile } from '../../domain/entities/Pokemon';
import { PokemonRepository } from '../../domain/repositories/PokemonRepository';

/**
 * Decorator: a Pokémon's data never changes, so each id is requested at most
 * once per session. Concurrent calls for the same id share one request, and
 * failures are not cached so the next pull can retry.
 */
export class CachingPokemonRepository implements PokemonRepository {
  private readonly cache = new Map<number, Promise<PokemonProfile>>();

  constructor(private readonly inner: PokemonRepository) {}

  getById(id: number): Promise<PokemonProfile> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const request = this.inner.getById(id).catch((error: unknown) => {
      this.cache.delete(id);
      throw error;
    });
    this.cache.set(id, request);
    return request;
  }
}
