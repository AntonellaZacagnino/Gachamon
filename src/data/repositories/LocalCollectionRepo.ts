import { Pokemon } from '../../domain/entities/Pokemon';
import { CollectionRepository } from '../../domain/repositories/CollectionRepository';
import { KeyValueStorage } from '../storage/KeyValueStorage';

const STORAGE_KEY = 'pokemon-gacha:collection:v1';

export class LocalCollectionRepo implements CollectionRepository {
  private loading: Promise<Map<number, Pokemon>> | null = null;

  constructor(private readonly storage: KeyValueStorage) {}

  async has(pokemonId: number): Promise<boolean> {
    return (await this.load()).has(pokemonId);
  }

  async add(pokemon: Pokemon): Promise<void> {
    const items = await this.load();
    items.set(pokemon.id, pokemon);
    await this.storage.setItem(STORAGE_KEY, JSON.stringify([...items.values()]));
  }

  async getAll(): Promise<Pokemon[]> {
    return [...(await this.load()).values()];
  }

  private load(): Promise<Map<number, Pokemon>> {
    this.loading ??= this.readFromStorage();
    return this.loading;
  }

  private async readFromStorage(): Promise<Map<number, Pokemon>> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    try {
      const list: Pokemon[] = raw ? JSON.parse(raw) : [];
      return new Map(list.map((pokemon) => [pokemon.id, pokemon]));
    } catch {
      return new Map(); // corrupted data: start with an empty collection
    }
  }
}
