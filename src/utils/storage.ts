import { db } from './firebase';
import { ref, set, onValue } from 'firebase/database';
import { AppData } from '../types';

const DB_PATH = 'erpData';

export const loadData = (): Promise<AppData | null> => {
  return new Promise((resolve) => {
    const dataRef = ref(db, DB_PATH);
    onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        resolve(snapshot.val());
      } else {
        resolve(null);
      }
    }, { onlyOnce: true });
  });
};

export const saveData = (data: AppData): Promise<void> => {
  const dataRef = ref(db, DB_PATH);
  return set(dataRef, data);
};

export const subscribeToData = (callback: (data: AppData) => void) => {
  const dataRef = ref(db, DB_PATH);
  return onValue(dataRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};
