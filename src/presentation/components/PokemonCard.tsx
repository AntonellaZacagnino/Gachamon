import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PullResult } from '../../domain/entities/PullResult';
import { RARITY_COLORS } from '../../shared/theme/rarityColors';
import { formatPokedexNumber, formatPokemonName } from '../../shared/utils/formatName';
import { holoStyleFor, PARALLAX, SPARKLE_SPOTS } from '../effects/holoStyle';
import { useTilt } from '../hooks/useTilt';
import { HoloFoil, HoloShine, Offset, Sparkles } from './HoloLayers';

interface Props {
  result: PullResult;
  onClose: () => void;
  /** Text of the dismiss button: "Collect" after a pull, "Close" when browsing the Pokédex. */
  buttonLabel?: string;
}

const CARD_ASPECT = 1.4; // height / width
const PERSPECTIVE = 800;

const shift = (tilt: Animated.Value, depth: number) =>
  tilt.interpolate({ inputRange: [-1, 1], outputRange: [-depth, depth] });

const offsetFor = (tiltX: Animated.Value, tiltY: Animated.Value, depth: number): Offset => ({
  x: shift(tiltX, depth),
  y: shift(tiltY, depth),
});

/** Collectible card with tilt-driven parallax and a rarity-based holographic foil. */
export function PokemonCard({ result, onClose, buttonLabel = 'Collect' }: Props) {
  const { pokemon, rarity, isNew } = result;
  const accent = RARITY_COLORS[rarity];
  const holo = holoStyleFor(rarity);

  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth * 0.78, 320);
  const height = width * CARD_ASPECT;
  const imageSize = width * 0.8;

  const { tiltX, tiltY, panHandlers } = useTilt({ width, height });
  const [imageFailed, setImageFailed] = useState(false);

  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, [entrance]);

  const layers = useMemo(() => {
    const maxDeg = PARALLAX.maxRotationDeg;
    return {
      rotateX: tiltY.interpolate({ inputRange: [-1, 1], outputRange: [`${maxDeg}deg`, `-${maxDeg}deg`] }),
      rotateY: tiltX.interpolate({ inputRange: [-1, 1], outputRange: [`-${maxDeg}deg`, `${maxDeg}deg`] }),
      foil: offsetFor(tiltX, tiltY, PARALLAX.foilDepth),
      pokemon: offsetFor(tiltX, tiltY, PARALLAX.pokemonDepth),
      shineX: tiltX.interpolate({ inputRange: [-1, 1], outputRange: [-width * 0.7, width * 0.7] }),
      sparkles: SPARKLE_SPOTS.map((_, index) =>
        offsetFor(
          tiltX,
          tiltY,
          PARALLAX.sparkleBaseDepth + (index % 3) * PARALLAX.sparkleDepthStep,
        ),
      ),
    };
  }, [tiltX, tiltY, width]);

  return (
    <View style={styles.backdrop}>
      <Animated.View
        style={{
          alignItems: 'center',
          opacity: entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
        }}
      >
        <View {...panHandlers}>
          <Animated.View
            style={[
              styles.card,
              {
                width,
                height,
                borderColor: accent,
                transform: [
                  { perspective: PERSPECTIVE },
                  { rotateX: layers.rotateX },
                  { rotateY: layers.rotateY },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#0b132b', `${accent}99`]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {holo.intensity > 0 && (
              <HoloFoil width={width} height={height} intensity={holo.intensity} offset={layers.foil} />
            )}

            {imageFailed ? (
              <Text style={[styles.fallback, { top: height * 0.15 }]}>?</Text>
            ) : (
              <Animated.Image
                source={{ uri: pokemon.spriteUrl }}
                resizeMode="contain"
                accessibilityLabel={pokemon.name}
                onError={() => setImageFailed(true)}
                style={{
                  position: 'absolute',
                  top: height * 0.05,
                  left: (width - imageSize) / 2,
                  width: imageSize,
                  height: imageSize,
                  transform: [{ translateX: layers.pokemon.x }, { translateY: layers.pokemon.y }],
                }}
              />
            )}

            {holo.shine && (
              <HoloShine width={width} height={height} intensity={holo.intensity} shineX={layers.shineX} />
            )}
            <Sparkles count={holo.sparkleCount} offsets={layers.sparkles} />

            <View style={styles.info}>
              <Text style={styles.number}>
                {formatPokedexNumber(pokemon.id)}
                {isNew && <Text style={styles.newTag}>  NEW!</Text>}
              </Text>
              <Text style={styles.name}>{formatPokemonName(pokemon.name)}</Text>
              <Text style={[styles.rarity, { color: accent }]}>{rarity}</Text>
            </View>
          </Animated.View>
        </View>

        <Pressable onPress={onClose} style={[styles.button, { backgroundColor: accent }]}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { borderRadius: 24, borderWidth: 2, overflow: 'hidden', backgroundColor: '#192b45' },
  fallback: { position: 'absolute', alignSelf: 'center', fontSize: 120, color: '#ffffff55' },
  info: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, backgroundColor: 'rgba(0,0,0,0.45)' },
  number: { color: '#ced4da', fontWeight: '600' },
  newTag: { color: '#ff6b6b', fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '800', color: 'white' },
  rarity: { fontWeight: '800', letterSpacing: 2 },
  button: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 999 },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 },
});
