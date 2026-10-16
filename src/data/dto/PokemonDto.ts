/** Subset of GET /pokemon/{id} that we actually use. */
export interface PokemonDto {
  readonly id: number;
  readonly name: string;
  readonly sprites: {
    readonly front_default: string | null;
    readonly other?: {
      readonly 'official-artwork'?: { readonly front_default: string | null };
    };
  };
}
