import { Animated, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PullResult } from '../../domain/entities/PullResult';
import { TOP_INSET } from '../../shared/theme/layout';
import { UI_COLORS } from '../../shared/theme/uiColors';
import { DEFAULT_ACCENT_COLOR, RARITY_COLORS } from '../../shared/theme/rarityColors';
import { GachaCanvas } from '../../three/GachaCanvas';
import { PokemonCard } from '../components/PokemonCard';
import { EnergyMeter } from '../energy/EnergyMeter';
import { EnergyView, useEnergy } from '../energy/useEnergy';
import { useDelayedFlag } from '../hooks/useDelayedFlag';
import { useGachaMachine } from '../hooks/useGachaMachine';

interface Props {
  pullGacha: { execute(): Promise<PullResult> };
  energy: EnergyView;
}

/** Lets the Pokémon enjoy its moment in the 3D scene before the card appears. */
const REVEAL_HOLD_MS = 900;

export function MachineScreen({ pullGacha, energy }: Props) {
  const { status, result, isPulling, pull, onAnimationComplete, reset } =
    useGachaMachine(pullGacha);
  const energyStatus = useEnergy(energy);
  const [isInsertingCoin, setIsInsertingCoin] = useState(false);
  const coinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrowBounce = useRef(new Animated.Value(0)).current;

  const busy = status === 'loading' || status === 'animating' || isInsertingCoin;
  const canPull = energyStatus?.canPull ?? false;
  const showCard = useDelayedFlag(status === 'revealed', REVEAL_HOLD_MS);
  const accentColor = result ? RARITY_COLORS[result.rarity] : DEFAULT_ACCENT_COLOR;

  useEffect(() => () => {
    if (coinTimer.current) clearTimeout(coinTimer.current);
  }, []);

  useEffect(() => {
    if (!canPull || busy) {
      arrowBounce.stopAnimation();
      arrowBounce.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBounce, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(arrowBounce, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [arrowBounce, busy, canPull]);

  const insertCoin = useCallback(() => {
    if (busy || !canPull) return;
    setIsInsertingCoin(true);
    coinTimer.current = setTimeout(() => {
      setIsInsertingCoin(false);
      coinTimer.current = null;
      void pull();
    }, 650);
  }, [busy, canPull, pull]);

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        <GachaCanvas
          isPulling={isPulling}
          accentColor={accentColor}
          pokemonImageUrl={result?.pokemon.spriteUrl ?? null}
          canInsertCoin={!busy && canPull}
          isInsertingCoin={isInsertingCoin}
          onInsertCoin={insertCoin}
          onAnimationComplete={onAnimationComplete}
        />
        {canPull && !busy && (
          <View pointerEvents="none" style={styles.tapHint}>
            <Text style={styles.tapHintLabel}>Tap Here</Text>
            <Animated.Text
              style={[
                styles.tapHintArrow,
                {
                  transform: [
                    {
                      translateY: arrowBounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 8],
                      }),
                    },
                  ],
                },
              ]}
            >
              ↓
            </Animated.Text>
          </View>
        )}
      </View>

      <View style={styles.energy} pointerEvents="none">
        <EnergyMeter status={energyStatus} />
      </View>

      {status === 'error' && (
        <Text style={styles.error}>Couldn't reach PokéAPI. Your energy was refunded.</Text>
      )}
      {showCard && result && <PokemonCard result={result} onClose={reset} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 12, backgroundColor: UI_COLORS.background },
  canvas: { flex: 1 }, // the Canvas needs a parent with a real size
  energy: { position: 'absolute', top: TOP_INSET, left: 0, right: 0 },
  error: { color: '#ffb4a2', textAlign: 'center', marginBottom: 12 },
  tapHint: {
    position: 'absolute',
    top: '54%',
    left: '24%',
    alignItems: 'center',
  },
  tapHintLabel: {
    color: UI_COLORS.surface,
    backgroundColor: UI_COLORS.accent,
    overflow: 'hidden',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: '800',
  },
  tapHintArrow: {
    color: UI_COLORS.accent,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '900',
    textShadowColor: '#0b132b',
    textShadowRadius: 4,
  },
});
