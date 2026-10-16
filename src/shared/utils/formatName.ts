/** "mr-mime" -> "Mr Mime" */
export const formatPokemonName = (name: string): string =>
  name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** 25 -> "#025" */
export const formatPokedexNumber = (id: number): string =>
  `#${String(id).padStart(3, '0')}`;

/** "LEGENDARY" -> "Legendary" */
export const formatRarity = (rarity: string): string =>
  rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
