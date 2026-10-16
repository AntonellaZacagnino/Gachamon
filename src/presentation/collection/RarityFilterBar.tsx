import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { RARITY_COLORS } from '../../shared/theme/rarityColors';
import { UI_COLORS } from '../../shared/theme/uiColors';
import { formatRarity } from '../../shared/utils/formatName';
import { RARITY_FILTERS, RarityFilter } from './collectionView';

interface Props {
  selected: RarityFilter;
  onSelect: (filter: RarityFilter) => void;
}

const labelOf = (filter: RarityFilter): string => (filter === 'ALL' ? 'All' : formatRarity(filter));

export function RarityFilterBar({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      style={styles.scroll}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {RARITY_FILTERS.map((filter) => {
        const active = filter === selected;
        const color = filter === 'ALL' ? UI_COLORS.text : RARITY_COLORS[filter];
        return (
          <Pressable
            key={filter}
            onPress={() => onSelect(filter)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.chip, { borderColor: color }, active && { backgroundColor: color }]}
          >
            <Text style={[styles.chipText, { color: active ? UI_COLORS.surface : color }]}>
              {labelOf(filter)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 6, gap: 8 },
  chip: {
    height: 40,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipText: { fontWeight: '800', fontSize: 13 },
});
