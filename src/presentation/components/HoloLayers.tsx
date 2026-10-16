import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet } from 'react-native';
import { HoloStyle, SPARKLE_SPOTS } from '../effects/holoStyle';

const RAINBOW = ['#ff0080', '#ff8c00', '#ffe600', '#00ff9d', '#00b3ff', '#8000ff'] as const;
const SHINE = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)'] as const;
const FOIL_BLEED = 40; // the foil is larger than the card so it can slide without gaps

export interface Offset {
  readonly x: Animated.AnimatedInterpolation<number>;
  readonly y: Animated.AnimatedInterpolation<number>;
}

interface CardSizeProps {
  width: number;
  height: number;
}

/** Rainbow foil that slides against the tilt, like a real holographic card. */
export function HoloFoil({
  width,
  height,
  intensity,
  offset,
}: CardSizeProps & { intensity: number; offset: Offset }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -FOIL_BLEED,
        top: -FOIL_BLEED,
        width: width + FOIL_BLEED * 2,
        height: height + FOIL_BLEED * 2,
        opacity: intensity * 0.4,
        transform: [{ translateX: offset.x }, { translateY: offset.y }],
      }}
    >
      <LinearGradient
        colors={RAINBOW}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/** Diagonal light streak that sweeps across the card as it tilts. */
export function HoloShine({
  width,
  height,
  intensity,
  shineX,
}: CardSizeProps & { intensity: number; shineX: Animated.AnimatedInterpolation<number> }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -height * 0.3,
        left: width * 0.25,
        width: width * 0.5,
        height: height * 1.6,
        opacity: 0.35 + intensity * 0.4,
        transform: [{ translateX: shineX }, { rotate: '20deg' }],
      }}
    >
      <LinearGradient
        colors={SHINE}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/** Sparkles at different depths: the closer ones move more. */
export function Sparkles({
  count,
  offsets,
}: {
  count: HoloStyle['sparkleCount'];
  offsets: readonly Offset[];
}) {
  return (
    <>
      {SPARKLE_SPOTS.slice(0, count).map((spot, index) => (
        <Animated.Text
          key={index}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${spot.left}%`,
            top: `${spot.top}%`,
            fontSize: spot.size,
            color: 'white',
            opacity: 0.85,
            transform: [{ translateX: offsets[index].x }, { translateY: offsets[index].y }],
          }}
        >
          ✦
        </Animated.Text>
      ))}
    </>
  );
}
