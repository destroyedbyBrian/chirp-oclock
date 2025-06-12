import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../storage/mmkvStorage'
import { STORAGE_KEYS } from '../storage/storageKeys';
import * as Notifications from 'expo-notifications';

export type Alarm = {
  id: string;
  hour: number;
  minute: number;
  ampm: string;
  notificationIdArray?: string[];
  // Optionally: ampm?: 'AM' | 'PM', label?: string, repeat?: string[]
};

type AlarmState = {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (updatedAlarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
  updateAlarmNotifications: (id: string, notificationIds: string[]) => void
};

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set) => ({
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
        set((state) => {
          // Find the alarm being deleted
          const alarmToDelete = state.alarms.find(alarm => alarm.id === id);
          
          // Cancel all notifications for this alarm
          if (alarmToDelete?.notificationIdArray) {
            alarmToDelete.notificationIdArray.forEach(async (notificationId) => {
              try {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
              } catch (error) {
                console.error('Error canceling notification:', error);
              }
            });
          }

          // Remove the alarm from the state
          return {
            alarms: state.alarms.filter(alarm => alarm.id !== id),
          };
        }),
        updateAlarmNotifications: (id: string, notificationIds: string[]) => 
        set((state) => ({
            alarms: state.alarms.map((alarm) =>
                alarm.id === id 
                    ? { ...alarm, notificationIdArray: notificationIds }
                    : alarm
            ),
        })),
    }),
    {
      name: STORAGE_KEYS.ALARMS_STORE,
      storage: zustandStorage,
    }
  )
);