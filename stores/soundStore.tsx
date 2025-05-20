import { create } from 'zustand';
import { Audio } from 'expo-av'; 

type AlarmSoundStore = {
  soundRef: Audio.Sound | null;
  setSoundRef: (ref: Audio.Sound | null) => void;

  isAlarmRinging: boolean;
  setIsAlarmRinging: (value: boolean) => void;
  stopAlarmSound: () => Promise<void>
};

export const useAlarmSoundStore = create<AlarmSoundStore>((set, get) => ({
  soundRef: null,
  setSoundRef: (ref) => set({ soundRef: ref }),

  isAlarmRinging: false,
  setIsAlarmRinging: (value) => set({ isAlarmRinging: value }),
  stopAlarmSound: async () => {
    const { soundRef } = get();            
    if (soundRef) {
      await soundRef.stopAsync();
      await soundRef.unloadAsync();
      set({ soundRef: null, isAlarmRinging: false });
    }
  }
}));
