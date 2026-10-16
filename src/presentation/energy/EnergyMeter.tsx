import { StyleSheet, Text, View } from 'react-native';
import { EnergyStatus } from '../../domain/entities/Energy';
import { UI_COLORS } from '../../shared/theme/uiColors';
import { energyHint } from './energyHint';

const EMPTY_COLOR = '#ff6b6b';

export function EnergyMeter({ status }: { status: EnergyStatus | null }) {
  if (!status) return null;

  const percent = (status.points / status.max) * 100;
  const color = status.canPull ? UI_COLORS.accent : EMPTY_COLOR;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Energy ${status.points} of ${status.max}`}
    >
      <View style={styles.row}>
        <Text style={[styles.bolt, { color }]}>⚡</Text>
        <Text style={styles.points}>
          {status.points}
          <Text style={styles.max}> / {status.max}</Text>
        </Text>
        <Text style={styles.cost}>Pull costs {status.costPerPull}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>

      <Text style={[styles.hint, !status.canPull && { color: EMPTY_COLOR }]}>
        {energyHint(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(154,171,193,0.16)',
    backgroundColor: 'rgba(25,43,69,0.94)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  bolt: { fontSize: 20, marginRight: 6 },
  points: { fontSize: 20, fontWeight: '800', color: UI_COLORS.text },
  max: { fontSize: 14, fontWeight: '600', color: UI_COLORS.muted },
  cost: { marginLeft: 'auto', fontSize: 12, fontWeight: '600', color: UI_COLORS.muted },
  track: {
    height: 6,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.11)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999 },
  hint: { marginTop: 6, fontSize: 12, fontWeight: '600', color: UI_COLORS.muted },
});
