import { create } from 'zustand';
import { Audio } from 'expo-av'; 
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../storage/mmkvStorage'
import { STORAGE_KEYS } from '../storage/storageKeys';

type AlarmSoundStore = {
  soundRef: Audio.Sound | null;
  setSoundRef: (ref: Audio.Sound | null) => void;

  isAlarmRinging: boolean;
  setIsAlarmRinging: (value: boolean) => void;
  stopAlarmSound: () => Promise<void>
};

export const useAlarmSoundStore = create<AlarmSoundStore>()(
  persist(
    (set, get) => ({
      soundRef: null,
      setSoundRef: (ref: Audio.Sound | null) => set({ soundRef: ref }),
      isAlarmRinging: false,
      setIsAlarmRinging: (value: boolean) => set({ isAlarmRinging: value }),
      stopAlarmSound: async () => {
        const { soundRef } = get();
        if (soundRef) {
          await soundRef.stopAsync();
          await soundRef.unloadAsync();
          set({ soundRef: null, isAlarmRinging: false });
        }
      },
    }), 
    {
      name: STORAGE_KEYS.SOUND_STORE,
      storage: zustandStorage,
    }
  )
);

