import { Platform, StatusBar } from 'react-native';

/** Space to keep content clear of the status bar / notch (no extra dependency needed). */
export const TOP_INSET: number = Platform.select({
  ios: 56,
  android: (StatusBar.currentHeight ?? 24) + 8,
  default: 16,
});
