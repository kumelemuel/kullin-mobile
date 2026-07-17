import { create } from 'zustand';

interface SyncState {
  pendingCount: number;
  lastSync: string | null;
  isSyncing: boolean;
  error: string | null;
  setPendingCount: (count: number) => void;
  setLastSync: (date: string) => void;
  setSyncing: (syncing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingCount: 0,
  lastSync: null,
  isSyncing: false,
  error: null,
  setPendingCount: (count) => set({ pendingCount: count }),
  setLastSync: (date) => set({ lastSync: date }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setError: (error) => set({ error }),
}));