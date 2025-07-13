import { create } from 'zustand';

export type SplashState = 'loading' | 'animating' | 'ready';

type AppStateStore = {
    isAppInForeGround: boolean;
    setIsAppInForeGround: (value: boolean) => void;

    splashState: SplashState;
    setSplashState: (state: SplashState) => void;
};

export const useAppStateStore = create<AppStateStore>((set) => ({
    isAppInForeGround: false,
    setIsAppInForeGround: (value) => set({ isAppInForeGround: value }),


    splashState: 'loading',
    setSplashState: (newState) => set({ splashState: newState }),
}));
