import { create } from 'zustand';
import { Audio } from 'expo-av'; // Make sure this is imported

type AlarmSoundStore = {
  soundRef: Audio.Sound | null;
  setSoundRef: (ref: Audio.Sound | null) => void;

  isAlarmRinging: boolean;
  setIsAlarmRinging: (value: boolean) => void;
};

export const useAlarmSoundStore = create<AlarmSoundStore>((set) => ({
  soundRef: null,
  setSoundRef: (ref) => set({ soundRef: ref }),

  isAlarmRinging: false,
  setIsAlarmRinging: (value) => set({ isAlarmRinging: value }),
}));
