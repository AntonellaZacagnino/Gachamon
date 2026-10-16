import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CollectionOverview } from '../../domain/entities/CollectionOverview';
import { PullResult } from '../../domain/entities/PullResult';
import { CollectionScreen } from '../collection/CollectionScreen';
import { EnergyView } from '../energy/useEnergy';
import { MachineScreen } from '../screens/MachineScreen';
import { useGachaStore } from '../state/gachaStore';
import { Tab, TabBar } from './TabBar';

interface Props {
  pullGacha: { execute(): Promise<PullResult> };
  getCollection: { execute(): Promise<CollectionOverview> };
  energy: EnergyView;
}

/**
 * Minimal two-tab navigator, with no extra dependency. Swap it for Expo Router or
 * React Navigation if the app grows more screens.
 */
export function AppNavigator({ pullGacha, getCollection, energy }: Props) {
  const [tab, setTab] = useState<Tab>('machine');
  const status = useGachaStore((state) => state.status);
  const reset = useGachaStore((state) => state.reset);
  const busy = status === 'loading' || status === 'animating';

  const select = useCallback(
    (next: Tab) => {
      if (busy || next === tab) return; // never leave in the middle of a pull
      reset(); // so the machine starts clean when we come back
      setTab(next);
    },
    [busy, tab, reset],
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tab === 'machine' ? (
          <MachineScreen pullGacha={pullGacha} energy={energy} />
        ) : (
          <CollectionScreen getCollection={getCollection} onGoToMachine={() => select('machine')} />
        )}
      </View>
      <TabBar active={tab} disabled={busy} onSelect={select} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
