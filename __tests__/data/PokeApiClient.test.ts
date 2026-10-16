import { PokeApiClient, PokeApiError } from '../../src/data/api/PokeApiClient';

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

describe('PokeApiClient', () => {
  it('requests the pokemon endpoint and returns the parsed body', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({ id: 25 }));
    const client = new PokeApiClient(fetchFn as unknown as typeof fetch);

    await expect(client.getPokemon(25)).resolves.toEqual({ id: 25 });
    expect(fetchFn.mock.calls[0][0]).toBe('https://pokeapi.co/api/v2/pokemon/25');
  });

  it('throws PokeApiError on a non-2xx response', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({}, 404));
    const client = new PokeApiClient(fetchFn as unknown as typeof fetch);

    await expect(client.getPokemon(25)).rejects.toBeInstanceOf(PokeApiError);
  });

  it('aborts the request after the timeout', async () => {
    const hanging: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    const client = new PokeApiClient(hanging, 'https://example.test', 20);

    await expect(client.getPokemon(1)).rejects.toThrow('aborted');
  });
});
