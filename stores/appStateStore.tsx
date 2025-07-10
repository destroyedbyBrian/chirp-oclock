// import { create } from 'zustand';

// type AppStateStore = {
//     isAppInForeGround: boolean,
//     setIsAppInForeGround: (value: boolean) => void;
// };

// export const useAppStateStore = create<AppStateStore>((set) => ({
//     isAppInForeGround: false,
//     setIsAppInForeGround: (value) => set({ isAppInForeGround: value})
// }));


import { create } from 'zustand';

// Define the clear, distinct states for the splash process
export type SplashState = 'loading' | 'animating' | 'ready';

type AppStateStore = {
    // Existing state
    isAppInForeGround: boolean;
    setIsAppInForeGround: (value: boolean) => void;

    // --- New state for splash management ---
    splashState: SplashState;
    setSplashState: (state: SplashState) => void;
};

export const useAppStateStore = create<AppStateStore>((set) => ({
    // Existing state implementation
    isAppInForeGround: false,
    setIsAppInForeGround: (value) => set({ isAppInForeGround: value }),

    // --- New state implementation ---
    // The app always starts in the 'loading' state.
    splashState: 'loading',
    // Action to transition between splash states.
    setSplashState: (newState) => set({ splashState: newState }),
}));
