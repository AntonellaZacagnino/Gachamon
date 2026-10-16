import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UI_COLORS } from '../../shared/theme/uiColors';

export type Tab = 'machine' | 'collection';

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'machine', label: 'Machine' },
  { id: 'collection', label: 'Pokédex' },
];

interface Props {
  active: Tab;
  disabled: boolean;
  onSelect: (tab: Tab) => void;
}

export function TabBar({ active, disabled, onSelect }: Props) {
  return (
    <View style={[styles.bar, disabled && styles.disabled]}>
      {TABS.map(({ id, label }) => (
        <Pressable
          key={id}
          disabled={disabled}
          onPress={() => onSelect(id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: id === active, disabled }}
          style={({ pressed }) => [
            styles.tab,
            id === active ? styles.activeTab : styles.inactiveTab,
            pressed && !disabled && styles.pressedTab,
          ]}
        >
          {id === active && (
            <>
              <LinearGradient
                colors={['#54c9f5', '#258bd8', '#1762b6']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View pointerEvents="none" style={styles.topHighlight} />
              <Text style={styles.selectionCursor}>▶</Text>
            </>
          )}
          <Text style={[styles.label, id === active ? styles.activeLabel : styles.inactiveLabel]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: UI_COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UI_COLORS.border,
  },
  disabled: { opacity: 0.5 },
  tab: {
    position: 'relative',
    flex: 1,
    height: 52,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  activeTab: {
    borderColor: '#9cecff',
    shadowColor: '#168bd3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 5,
  },
  inactiveTab: {
    backgroundColor: '#192d49',
    borderColor: '#45688e',
    borderBottomWidth: 3,
  },
  pressedTab: { transform: [{ translateY: 2 }], shadowOpacity: 0.12, elevation: 2 },
  topHighlight: {
    position: 'absolute',
    top: 2,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  label: { fontWeight: '800', fontSize: 14, letterSpacing: 0.35 },
  activeLabel: { color: '#ffffff', textShadowColor: 'rgba(8,38,77,0.4)', textShadowRadius: 2 },
  inactiveLabel: { color: '#c2d4e8' },
  selectionCursor: {
    position: 'absolute',
    left: 14,
    color: UI_COLORS.accent,
    fontSize: 11,
    textShadowColor: 'rgba(10,32,57,0.6)',
    textShadowRadius: 3,
  },
});
