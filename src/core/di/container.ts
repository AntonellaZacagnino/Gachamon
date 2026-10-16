import AsyncStorage from '@react-native-async-storage/async-storage';
import { PokeApiClient } from '../../data/api/PokeApiClient';
import { SystemClock } from '../../data/clock/SystemClock';
import { CachingPokemonRepository } from '../../data/repositories/CachingPokemonRepository';
import { EnergyStorageRepository } from '../../data/repositories/EnergyStorageRepository';
import { LocalCollectionRepo } from '../../data/repositories/LocalCollectionRepo';
import { MathRandomSource } from '../../data/repositories/MathRandomSource';
import { PokeApiRepository } from '../../data/repositories/PokeApiRepository';
import { DropRateTable } from '../../domain/services/DropRateTable';
import { EnergyRules } from '../../domain/services/EnergyRules';
import { EnergyService } from '../../domain/services/EnergyService';
import { GachaEngine } from '../../domain/services/GachaEngine';
import { PokemonCatalog } from '../../domain/services/PokemonCatalog';
import { GetCollectionUseCase } from '../../domain/usecases/GetCollectionUseCase';
import { PullGachaUseCase } from '../../domain/usecases/PullGachaUseCase';

// Composition root: the only place that knows which implementation is used.
const engine = new GachaEngine(DropRateTable.default(), new MathRandomSource());
const catalog = PokemonCatalog.gen1();
const pokemonRepository = new CachingPokemonRepository(
  new PokeApiRepository(new PokeApiClient()),
);
const collectionRepository = new LocalCollectionRepo(AsyncStorage);
const energy = new EnergyService(
  new EnergyRules(),
  new EnergyStorageRepository(AsyncStorage),
  new SystemClock(),
);

export const container = {
  energy,
  pullGacha: new PullGachaUseCase(engine, catalog, pokemonRepository, collectionRepository, energy),
  getCollection: new GetCollectionUseCase(catalog, collectionRepository),
} as const;
