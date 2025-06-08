import { MMKV } from 'react-native-mmkv';
import { PersistStorage, StorageValue } from 'zustand/middleware';

export const storage = new MMKV();

export const zustandStorage: PersistStorage<any> = {
  getItem: (name: string): StorageValue<any> | null => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: StorageValue<any>): void => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};