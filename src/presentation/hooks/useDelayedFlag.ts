import { useEffect, useState } from 'react';

/** true only after `active` has stayed true for `delayMs`. */
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }
    const timer = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return active && ready;
}
