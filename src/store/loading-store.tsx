import { create } from "zustand";

interface LoadingStore {
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isGlobalLoading: false,
  setGlobalLoading: (loading: boolean) => set({ isGlobalLoading: loading }),
}));
