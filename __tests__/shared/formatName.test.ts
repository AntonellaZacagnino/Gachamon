import { formatPokedexNumber, formatPokemonName, formatRarity } from '../../src/shared/utils/formatName';

describe('formatName', () => {
  it('capitalizes names and splits hyphens', () => {
    expect(formatPokemonName('pikachu')).toBe('Pikachu');
    expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
  });

  it('pads the pokedex number', () => {
    expect(formatPokedexNumber(5)).toBe('#005');
    expect(formatPokedexNumber(150)).toBe('#150');
  });
});

describe('formatRarity', () => {
  it('capitalizes only the first letter', () => {
    expect(formatRarity('LEGENDARY')).toBe('Legendary');
    expect(formatRarity('RARE')).toBe('Rare');
  });
});
