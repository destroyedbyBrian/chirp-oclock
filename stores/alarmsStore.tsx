import { create } from 'zustand';

export type Alarm = {
  id: string;
  hour: number;
  minute: number;
  ampm: string;
  // Optionally: ampm?: 'AM' | 'PM', label?: string, repeat?: string[]
};

type AlarmsState = {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
};

export const useAlarmsStore = create<AlarmsState>((set) => ({
  alarms: [],
  addAlarm: (alarm) =>
    set((state) => ({
      alarms: [...state.alarms, alarm],
    })),
}));
