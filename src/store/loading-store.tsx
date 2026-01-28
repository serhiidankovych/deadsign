import { create } from "zustand";

interface LoadingStore {
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean, minDuration?: number) => void;
}

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  isGlobalLoading: false,

  setGlobalLoading: (loading: boolean, minDuration: number = 0) => {
    if (loading) {
      set({ isGlobalLoading: true });
    } else {
      if (minDuration > 0) {
        setTimeout(() => {
          set({ isGlobalLoading: false });
        }, minDuration);
      } else {
        set({ isGlobalLoading: false });
      }
    }
  },
}));
