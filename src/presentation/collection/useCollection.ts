import { useCallback, useEffect, useRef, useState } from 'react';
import { CollectionOverview } from '../../domain/entities/CollectionOverview';

export type CollectionState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly overview: CollectionOverview };

interface GetCollection {
  execute(): Promise<CollectionOverview>;
}

export function useCollection(getCollection: GetCollection) {
  const [state, setState] = useState<CollectionState>({ status: 'loading' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const overview = await getCollection.execute();
      if (mounted.current) setState({ status: 'ready', overview });
    } catch {
      if (mounted.current) setState({ status: 'error' });
    }
  }, [getCollection]);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, reload: load };
}
