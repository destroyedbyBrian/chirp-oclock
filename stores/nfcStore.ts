import { create } from 'zustand';

interface NfcStore {
  nfcPromptVisible: boolean;
  setNfcPromptVisible: (visible: boolean) => void;
}

export const useNfcStore = create<NfcStore>((set) => ({
  nfcPromptVisible: false,
  setNfcPromptVisible: (visible) => set({ nfcPromptVisible: visible }),
})); 