import { DeviceMotion } from 'expo-sensors';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import { normalizeDrag, normalizeTilt, smoothTilt, Tilt } from '../effects/tilt';

const SENSOR_INTERVAL_MS = 16;
// If the card feels inverted on a real device, flip a sign here.
const SENSOR_SIGN = { x: 1, y: -1 } as const;
const DRAG_SIGN = { x: 1, y: -1 } as const;

interface CardSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Produces two Animated values in [-1, 1].
 * - On a real device they follow the phone's tilt (relative to how it was held
 *   when the card appeared).
 * - Dragging a finger over the card also drives them, so the effect works on the
 *   emulator and on devices without motion sensors.
 */
export function useTilt({ width, height }: CardSize) {
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const dragging = useRef(false);
  const smoothed = useRef<Tilt>({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    let subscription: { remove(): void } | undefined;
    let baseline: { beta: number; gamma: number } | null = null;

    const start = async () => {
      try {
        const { granted } = await DeviceMotion.requestPermissionsAsync();
        if (cancelled || !granted || !(await DeviceMotion.isAvailableAsync())) return;

        DeviceMotion.setUpdateInterval(SENSOR_INTERVAL_MS);
        subscription = DeviceMotion.addListener(({ rotation }) => {
          if (!rotation || dragging.current) return;

          baseline ??= { beta: rotation.beta, gamma: rotation.gamma };
          const target: Tilt = {
            x: SENSOR_SIGN.x * normalizeTilt(rotation.gamma - baseline.gamma),
            y: SENSOR_SIGN.y * normalizeTilt(rotation.beta - baseline.beta),
          };
          smoothed.current = smoothTilt(smoothed.current, target);
          tiltX.setValue(smoothed.current.x);
          tiltY.setValue(smoothed.current.y);
        });
      } catch {
        // No sensor available: dragging still works.
      }
    };
    void start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [tiltX, tiltY]);

  const panHandlers = useMemo(() => {
    const release = () => {
      dragging.current = false;
      smoothed.current = { x: 0, y: 0 };
      Animated.spring(tiltX, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(tiltY, { toValue: 0, useNativeDriver: true }).start();
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragging.current = true;
      },
      onPanResponderMove: (_event, gesture) => {
        tiltX.setValue(DRAG_SIGN.x * normalizeDrag(gesture.dx, width / 2));
        tiltY.setValue(DRAG_SIGN.y * normalizeDrag(gesture.dy, height / 2));
      },
      onPanResponderRelease: release,
      onPanResponderTerminate: release,
    }).panHandlers;
  }, [tiltX, tiltY, width, height]);

  return { tiltX, tiltY, panHandlers };
}
