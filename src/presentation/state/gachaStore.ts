import { create } from 'zustand';
import { PullResult } from '../../domain/entities/PullResult';

export type GachaStatus = 'idle' | 'loading' | 'animating' | 'revealed' | 'error';

interface GachaState {
  status: GachaStatus;
  result: PullResult | null;
  startLoading: () => void;
  startAnimating: (result: PullResult) => void;
  reveal: () => void;
  fail: () => void;
  reset: () => void;
}

export const useGachaStore = create<GachaState>((set) => ({
  status: 'idle',
  result: null,
  startLoading: () => set({ status: 'loading', result: null }),
  startAnimating: (result) => set({ status: 'animating', result }),
  reveal: () => set({ status: 'revealed' }),
  fail: () => set({ status: 'error', result: null }),
  reset: () => set({ status: 'idle', result: null }),
}));
