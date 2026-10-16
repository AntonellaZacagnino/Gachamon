import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CollectionEntry } from '../../domain/entities/CollectionOverview';
import { Pokemon } from '../../domain/entities/Pokemon';
import { RARITY_COLORS } from '../../shared/theme/rarityColors';
import { UI_COLORS } from '../../shared/theme/uiColors';
import { formatPokedexNumber, formatPokemonName } from '../../shared/utils/formatName';

interface Props {
  entry: CollectionEntry;
  width: number;
  onPress: (pokemon: Pokemon) => void;
}

const ASPECT = 1.2; // height / width

/**
 * Caught Pokémon show their artwork. Missing ones show only "?" and the rarity colour,
 * so the screen never downloads images (or data) for Pokémon the player does not own.
 */
export const CollectionSlot = memo(function CollectionSlot({ entry, width, onPress }: Props) {
  const accent = RARITY_COLORS[entry.rarity];
  const { pokemon } = entry;
  const size = { width, height: width * ASPECT };

  if (!pokemon) {
    return (
      <View
        style={[styles.slot, styles.locked, size, { borderColor: `${accent}66` }]}
        accessibilityLabel={`${formatPokedexNumber(entry.id)} not caught yet`}
      >
        <Text style={styles.question}>?</Text>
        <Text style={styles.number}>{formatPokedexNumber(entry.id)}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(pokemon)}
      accessibilityRole="button"
      accessibilityLabel={`${formatPokemonName(pokemon.name)}, ${entry.rarity.toLowerCase()}`}
      style={[styles.slot, size, { borderColor: accent }]}
    >
      <Image source={{ uri: pokemon.spriteUrl }} style={styles.image} resizeMode="contain" />
      <Text style={styles.number}>{formatPokedexNumber(pokemon.id)}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {formatPokemonName(pokemon.name)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: UI_COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  locked: { borderStyle: 'dashed', opacity: 0.85 },
  question: { fontSize: 34, fontWeight: '800', color: '#ffffff33' },
  image: { flex: 1, width: '100%' },
  number: { fontSize: 11, fontWeight: '700', color: UI_COLORS.muted },
  name: { fontSize: 12, fontWeight: '800', color: UI_COLORS.text },
});
