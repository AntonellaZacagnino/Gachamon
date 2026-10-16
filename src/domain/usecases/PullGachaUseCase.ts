import { Pokemon } from '../entities/Pokemon';
import { PullResult } from '../entities/PullResult';
import { CollectionRepository } from '../repositories/CollectionRepository';
import { PokemonRepository } from '../repositories/PokemonRepository';
import { EnergyPort } from '../services/EnergyService';
import { GachaEngine } from '../services/GachaEngine';
import { PokemonCatalog } from '../services/PokemonCatalog';

export class PullGachaUseCase {
  constructor(
    private readonly engine: GachaEngine,
    private readonly catalog: PokemonCatalog,
    private readonly pokemonRepository: PokemonRepository,
    private readonly collectionRepository: CollectionRepository,
    private readonly energy: EnergyPort,
  ) {}

  /** Throws InsufficientEnergyError when there is not enough energy; nothing else happens then. */
  async execute(): Promise<PullResult> {
    await this.energy.spend();

    try {
      const rarity = this.engine.rollRarity();
      const pokemonId = this.engine.pickOne(this.catalog.idsByRarity(rarity));

      // The only network access of a pull: exactly one Pokémon.
      const profile = await this.pokemonRepository.getById(pokemonId);
      const pokemon: Pokemon = { ...profile, rarity };

      const isNew = !(await this.collectionRepository.has(pokemon.id));
      await this.collectionRepository.add(pokemon);

      return { pokemon, rarity, isNew };
    } catch (error) {
      // The player should not pay for a pull that never gave them a Pokémon.
      await this.energy.refund();
      throw error;
    }
  }
}
