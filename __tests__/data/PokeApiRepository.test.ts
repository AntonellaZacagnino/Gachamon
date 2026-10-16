import { PokemonDto } from '../../src/data/dto/PokemonDto';
import { PokeApiRepository } from '../../src/data/repositories/PokeApiRepository';

const makeClient = () => ({
  getPokemon: jest.fn(
    async (id: number): Promise<PokemonDto> => ({
      id,
      name: `pokemon-${id}`,
      sprites: { front_default: `https://img/${id}.png` },
    }),
  ),
});

describe('PokeApiRepository', () => {
  it('maps the API response to a profile', async () => {
    const repository = new PokeApiRepository(makeClient());
    await expect(repository.getById(25)).resolves.toEqual({
      id: 25,
      name: 'pokemon-25',
      spriteUrl: 'https://img/25.png',
    });
  });

  it.each([0, -1, 151, 1.5, NaN])('refuses id %p without calling the API', async (id) => {
    const client = makeClient();
    const repository = new PokeApiRepository(client);

    await expect(repository.getById(id)).rejects.toThrow(RangeError);
    expect(client.getPokemon).not.toHaveBeenCalled();
  });

  it('accepts the boundaries 1 and 150', async () => {
    const repository = new PokeApiRepository(makeClient());
    await expect(repository.getById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repository.getById(150)).resolves.toMatchObject({ id: 150 });
  });
});
