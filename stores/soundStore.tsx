import { create } from 'zustand';
import { Audio } from 'expo-av'; 
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../storage/mmkvStorage'
import { STORAGE_KEYS } from '../storage/storageKeys';

type AlarmSoundStore = {
  soundRef: Audio.Sound | null;
  isAlarmRinging: boolean;
  setSoundRef: (ref: Audio.Sound | null) => void;
  setIsAlarmRinging: (value: boolean) => void;
  stopAlarmSound: () => Promise<void>
};

export const useAlarmSoundStore = create<AlarmSoundStore>()(
  persist(
    (set, get) => ({
      soundRef: null,
      isAlarmRinging: false,
      setSoundRef: (ref: Audio.Sound | null) => set({ soundRef: ref }),
      setIsAlarmRinging: (value: boolean) => set({ isAlarmRinging: value }),
      stopAlarmSound: async () => {
        const soundRef = get().soundRef;
        if (soundRef && typeof soundRef.stopAsync === 'function') {
            try {
                console.log('Stopping alarm sound...');
                await soundRef.stopAsync();
                await soundRef.unloadAsync();
                console.log('Alarm sound stopped and unloaded');
            } catch (error) {
                console.log('Error stopping alarm sound:', error);
            } finally {
                // Always reset state even if there's an error
                set({ soundRef: null, isAlarmRinging: false });
                console.log('Sound state reset');
            }
        } else {
            // If soundRef is invalid or doesn't exist, still reset the state
            console.log('No valid sound ref found, resetting state');
            set({ soundRef: null, isAlarmRinging: false });
        }
      },
    }), 
    {
      name: STORAGE_KEYS.SOUND_STORE,
      storage: zustandStorage,
      partialize: (state) => ({ 
        isAlarmRinging: state.isAlarmRinging 
        // Don't persist soundRef
      }),
    }
  )
);

