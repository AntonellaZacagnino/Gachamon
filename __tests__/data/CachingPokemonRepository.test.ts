import { PokemonProfile } from '../../src/domain/entities/Pokemon';
import { CachingPokemonRepository } from '../../src/data/repositories/CachingPokemonRepository';

const profile = (id: number): PokemonProfile => ({ id, name: `p${id}`, spriteUrl: 'x' });

describe('CachingPokemonRepository', () => {
  it('requests each id only once', async () => {
    const inner = { getById: jest.fn(async (id: number) => profile(id)) };
    const repository = new CachingPokemonRepository(inner);

    await repository.getById(25);
    await repository.getById(25);
    await repository.getById(26);

    expect(inner.getById).toHaveBeenCalledTimes(2);
  });

  it('shares one in-flight request between concurrent callers', async () => {
    const inner = { getById: jest.fn(async (id: number) => profile(id)) };
    const repository = new CachingPokemonRepository(inner);

    await Promise.all([repository.getById(7), repository.getById(7), repository.getById(7)]);

    expect(inner.getById).toHaveBeenCalledTimes(1);
  });

  it('does not cache failures, so the next call retries', async () => {
    const inner = {
      getById: jest
        .fn()
        .mockRejectedValueOnce(new Error('network down'))
        .mockResolvedValueOnce(profile(7)),
    };
    const repository = new CachingPokemonRepository(inner);

    await expect(repository.getById(7)).rejects.toThrow('network down');
    await expect(repository.getById(7)).resolves.toEqual(profile(7));
    expect(inner.getById).toHaveBeenCalledTimes(2);
  });
});
