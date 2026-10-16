import { PokemonDto } from '../../src/data/dto/PokemonDto';
import { toPokemonProfile } from '../../src/data/mappers/PokemonMapper';

const dto = (sprites: PokemonDto['sprites']): PokemonDto => ({ id: 25, name: 'pikachu', sprites });

describe('toPokemonProfile', () => {
  it('prefers the official artwork', () => {
    const profile = toPokemonProfile(
      dto({ front_default: 'small.png', other: { 'official-artwork': { front_default: 'big.png' } } }),
    );
    expect(profile).toEqual({ id: 25, name: 'pikachu', spriteUrl: 'big.png' });
  });

  it('falls back to the default sprite', () => {
    const profile = toPokemonProfile(
      dto({ front_default: 'small.png', other: { 'official-artwork': { front_default: null } } }),
    );
    expect(profile.spriteUrl).toBe('small.png');
  });

  it('throws when there is no image at all', () => {
    expect(() => toPokemonProfile(dto({ front_default: null }))).toThrow('no image');
  });
});
