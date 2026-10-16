import { PokemonDto } from '../dto/PokemonDto';

const DEFAULT_BASE_URL = 'https://pokeapi.co/api/v2';
const DEFAULT_TIMEOUT_MS = 8000;

export class PokeApiError extends Error {}

export class PokeApiClient {
  constructor(
    // Wrapped so the global fetch is never called with a foreign `this`.
    private readonly fetchFn: typeof fetch = (input, init) => fetch(input, init),
    private readonly baseUrl: string = DEFAULT_BASE_URL,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {}

  getPokemon(id: number): Promise<PokemonDto> {
    return this.get<PokemonDto>(`/pokemon/${id}`);
  }

  private async get<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(`${this.baseUrl}${path}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new PokeApiError(`PokéAPI responded ${response.status} for ${path}`);
      }
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
