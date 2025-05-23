import { create } from 'zustand';

type AppStateStore = {
    isAppInForeGround: boolean,
    setIsAppInForeGround: (value: boolean) => void;
};

export const useAppStateStore = create<AppStateStore>((set) => ({
    isAppInForeGround: false,
    setIsAppInForeGround: (value) => set({ isAppInForeGround: value})
}));