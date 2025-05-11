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
  updateAlarm: (updatedAlarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
};

export const useAlarmsStore = create<AlarmsState>((set) => ({
  alarms: [],
  addAlarm: (alarm) =>
    set((state) => ({
      alarms: [...state.alarms, alarm],
    })),
  updateAlarm: (updated) =>
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === updated.id ? updated : alarm
      ),
    })),
  deleteAlarm: (id) =>
    set((state) => ({
      alarms: state.alarms.filter(alarm => alarm.id !== id),
    })),
}));

