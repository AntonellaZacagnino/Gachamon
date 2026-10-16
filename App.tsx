import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { container } from './src/core/di/container';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { UI_COLORS } from './src/shared/theme/uiColors';

const SPLASH_DURATION = 5000;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    }).start();

    const timeout = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timeout);
  }, [progress]);

  if (showSplash) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('./assets/gachamon-logo.png')}
          resizeMode="contain"
          style={styles.logo}
          accessibilityLabel="Gachamon"
        />
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <AppNavigator
      pullGacha={container.pullGacha}
      getCollection={container.getCollection}
      energy={container.energy}
    />
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI_COLORS.background,
    paddingHorizontal: 32,
  },
  logo: {
    width: 280,
    height: 180,
    maxWidth: '100%',
    marginBottom: 36,
  },
  progressTrack: {
    width: '72%',
    maxWidth: 280,
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(244, 247, 251, 0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: UI_COLORS.accent,
  },
});
