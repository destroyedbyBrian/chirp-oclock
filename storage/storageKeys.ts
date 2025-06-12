// MMKV Storage Keys
export const STORAGE_KEYS = {
    // Alarm related
    NEXT_ALARM_DUE: 'next-alarm-due',
    ALARM_DUE_DATE: 'alarm-due-date',
    
    // Store persistence keys
    ALARMS_STORE: 'alarms-storage',
    SOUND_STORE: 'sound-storage',
} as const;

// Type for the storage keys
export type StorageKey = keyof typeof STORAGE_KEYS; 