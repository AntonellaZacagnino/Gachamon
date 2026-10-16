import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { CollectionEntry, CollectionOverview } from '../../domain/entities/CollectionOverview';
import { Pokemon } from '../../domain/entities/Pokemon';
import { TOP_INSET } from '../../shared/theme/layout';
import { UI_COLORS } from '../../shared/theme/uiColors';
import { PokemonCard } from '../components/PokemonCard';
import { CollectionHeader } from './CollectionHeader';
import { CollectionSlot } from './CollectionSlot';
import { filterEntries, RarityFilter } from './collectionView';
import { RarityFilterBar } from './RarityFilterBar';
import { useCollection } from './useCollection';

interface Props {
  getCollection: { execute(): Promise<CollectionOverview> };
  onGoToMachine: () => void;
}

const COLUMNS = 3;
const GAP = 8;
const SIDE_PADDING = 12;

export function CollectionScreen({ getCollection, onGoToMachine }: Props) {
  const { state, reload } = useCollection(getCollection);
  const [filter, setFilter] = useState<RarityFilter>('ALL');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [selected, setSelected] = useState<Pokemon | null>(null);

  const { width } = useWindowDimensions();
  const slotWidth = Math.floor((width - SIDE_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

  const entries = useMemo(
    () => (state.status === 'ready' ? filterEntries(state.overview.entries, filter, ownedOnly) : []),
    [state, filter, ownedOnly],
  );

  const handleSelect = useCallback((pokemon: Pokemon) => setSelected(pokemon), []);
  const renderItem = useCallback(
    ({ item }: { item: CollectionEntry }) => (
      <CollectionSlot entry={item} width={slotWidth} onPress={handleSelect} />
    ),
    [slotWidth, handleSelect],
  );

  if (state.status === 'loading') {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={UI_COLORS.accent} />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.message}>Couldn't load your collection.</Text>
        <Button title="Try again" onPress={reload} />
      </View>
    );
  }

  const { overview } = state;

  return (
    <View style={styles.container}>
      <CollectionHeader overview={overview} />

      {overview.owned === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.message}>Your Pokédex is empty. Pull the lever to catch your first Pokémon!</Text>
          <Button title="Go to the machine" onPress={onGoToMachine} />
        </View>
      ) : (
        <>
          <RarityFilterBar selected={filter} onSelect={setFilter} />
          <View style={styles.ownedRow}>
            <Text style={styles.ownedLabel}>Only caught</Text>
            <Switch value={ownedOnly} onValueChange={setOwnedOnly} />
          </View>

          <FlatList
            data={entries}
            keyExtractor={(entry) => String(entry.id)}
            renderItem={renderItem}
            numColumns={COLUMNS}
            columnWrapperStyle={styles.columns}
            contentContainerStyle={styles.list}
            initialNumToRender={18}
            windowSize={7}
            ListEmptyComponent={<Text style={styles.message}>No Pokémon match this filter.</Text>}
          />
        </>
      )}

      {selected && (
        <PokemonCard
          result={{ pokemon: selected, rarity: selected.rarity, isNew: false }}
          buttonLabel="Close"
          onClose={() => setSelected(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: TOP_INSET, backgroundColor: UI_COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { color: UI_COLORS.text, textAlign: 'center', fontSize: 16, marginBottom: 16 },
  ownedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SIDE_PADDING,
  },
  ownedLabel: { color: UI_COLORS.muted, fontWeight: '600', marginRight: 8 },
  columns: { gap: GAP, paddingHorizontal: SIDE_PADDING },
  list: { gap: GAP, paddingTop: 8, paddingBottom: 24 },
});
