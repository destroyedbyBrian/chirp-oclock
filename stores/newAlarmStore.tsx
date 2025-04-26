import { create } from 'zustand';

type NewAlarmState = {
  hour: number;
  minute: number;
  ampm: string;
  setHour: (h: number) => void;
  setMinute: (m: number) => void;
  setAmpm: (ampm: string) => void;
};

export const useNewAlarmStore = create<NewAlarmState>((set) => ({
  hour: 7,
  minute: 0,
  ampm: 'AM',
  setHour: (hour) => set({ hour }),
  setMinute: (minute) => set({ minute }),
  setAmpm: (ampm) => set({ ampm }),
}));
