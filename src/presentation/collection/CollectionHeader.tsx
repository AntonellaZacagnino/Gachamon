import { StyleSheet, Text, View } from 'react-native';
import { CollectionOverview } from '../../domain/entities/CollectionOverview';
import { Rarity } from '../../domain/entities/Rarity';
import { RARITY_COLORS } from '../../shared/theme/rarityColors';
import { UI_COLORS } from '../../shared/theme/uiColors';
import { formatRarity } from '../../shared/utils/formatName';
import { completionPercent } from './collectionView';

export function CollectionHeader({ overview }: { overview: CollectionOverview }) {
  const percent = completionPercent(overview.owned, overview.total);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Pokédex</Text>
        <Text style={styles.count}>
          {overview.owned} / {overview.total}  ·  {percent}%
        </Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.rarityRow}>
        {Object.values(Rarity).map((rarity) => {
          const { owned, total } = overview.byRarity[rarity];
          return (
            <View key={rarity} style={styles.rarityItem} accessibilityLabel={`${formatRarity(rarity)} ${owned} of ${total}`}>
              <View style={[styles.dot, { backgroundColor: RARITY_COLORS[rarity] }]} />
              <Text style={styles.rarityText}>
                {owned}/{total}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontSize: 27, fontWeight: '800', letterSpacing: -0.6, color: UI_COLORS.text },
  count: { fontSize: 14, fontWeight: '700', color: UI_COLORS.accent },
  barTrack: {
    height: 7,
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: UI_COLORS.accent },
  rarityRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  rarityItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  rarityText: { color: UI_COLORS.text, fontWeight: '600', fontSize: 13 },
});
