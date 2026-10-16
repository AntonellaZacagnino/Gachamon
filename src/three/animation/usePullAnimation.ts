import { useFrame } from '@react-three/fiber/native';
import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { PullAnimator } from './PullAnimator';
import { IDLE_FRAME, PullFrame } from './PullPhase';

/**
 * Drives the timeline from the render loop. Returns a ref (not state) so
 * models can read the current frame every tick without re-rendering React.
 * Must be called inside a component rendered within <Canvas>.
 */
export function usePullAnimation(
  isPulling: boolean,
  onComplete: () => void,
): MutableRefObject<PullFrame> {
  const animator = useMemo(() => new PullAnimator(), []);
  const frameRef = useRef<PullFrame>(IDLE_FRAME);
  const elapsedMsRef = useRef(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    elapsedMsRef.current = 0;
    completedRef.current = false;
    if (!isPulling) frameRef.current = IDLE_FRAME;
  }, [isPulling]);

  useFrame((_, deltaSeconds) => {
    if (!isPulling) return;

    elapsedMsRef.current += deltaSeconds * 1000;
    frameRef.current = animator.frameAt(elapsedMsRef.current);

    if (frameRef.current.phase === 'revealed' && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current();
    }
  });

  return frameRef;
}
