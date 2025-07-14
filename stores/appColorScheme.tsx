import { zustandStorage } from '@/storage/mmkvStorage';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { create } from 'zustand';


type AppColorSchemeStore = {
    isAppColorSchemeDark: boolean,
    setIsAppColorSchemeDark: (value: boolean) => void;
};

export const useAppColorScheme = create<AppColorSchemeStore>()(
    persist(
        (set) => ({
            isAppColorSchemeDark: false,
            setIsAppColorSchemeDark: (value) => set({ isAppColorSchemeDark: value})
    }), 
    {
        name: STORAGE_KEYS.APPCOLORSCHEME_STORE,
        storage: zustandStorage,
    }
));