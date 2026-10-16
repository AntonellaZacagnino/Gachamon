import { CollectionOverview } from '../entities/CollectionOverview';
import { CollectionRepository } from '../repositories/CollectionRepository';
import { buildCollectionOverview } from '../services/buildCollectionOverview';
import { PokemonCatalog } from '../services/PokemonCatalog';

export class GetCollectionUseCase {
  constructor(
    private readonly catalog: PokemonCatalog,
    private readonly collectionRepository: CollectionRepository,
  ) {}

  async execute(): Promise<CollectionOverview> {
    return buildCollectionOverview(this.catalog, await this.collectionRepository.getAll());
  }
}
