import { useCallback } from 'react';
import { Image } from 'react-native';
import { PullResult } from '../../domain/entities/PullResult';
import { InsufficientEnergyError } from '../../domain/errors/InsufficientEnergyError';
import { useGachaStore } from '../state/gachaStore';

interface PullGacha {
  execute(): Promise<PullResult>;
}

/**
 * The use case is injected, so the screen decides which implementation to use
 * (real one from the DI container, or a stub in tests/storybook).
 */
export function useGachaMachine(pullGacha: PullGacha) {
  const { status, result, startLoading, startAnimating, reveal, fail, reset } = useGachaStore();

  const pull = useCallback(async () => {
    if (status === 'loading' || status === 'animating') return;
    startLoading();
    try {
      // The outcome is decided here, BEFORE the animation starts.
      const pulled = await pullGacha.execute();

      // Warm the image cache while the ball animation plays, so the artwork is ready
      // the moment it is revealed. Failure is harmless.
      Image.prefetch(pulled.pokemon.spriteUrl).catch(() => undefined);

      startAnimating(pulled);
    } catch (error) {
      // No energy is not a failure of the machine: go back to idle, the energy bar explains why.
      if (error instanceof InsufficientEnergyError) reset();
      else fail();
    }
  }, [status, pullGacha, startLoading, startAnimating, fail, reset]);

  return {
    status,
    result,
    isPulling: status === 'animating',
    pull,
    onAnimationComplete: reveal,
    reset,
  };
}
