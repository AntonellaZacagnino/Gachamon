import { PokemonProfile } from '../../domain/entities/Pokemon';
import { PokemonDto } from '../dto/PokemonDto';

export function toPokemonProfile(dto: PokemonDto): PokemonProfile {
  const imageUrl =
    dto.sprites.other?.['official-artwork']?.front_default ?? dto.sprites.front_default;

  if (!imageUrl) {
    throw new Error(`Pokémon #${dto.id} has no image available`);
  }
  return { id: dto.id, name: dto.name, spriteUrl: imageUrl };
}
