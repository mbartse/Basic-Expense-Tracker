import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserSettings } from '../types/settings';

export const DEFAULT_SETTINGS: UserSettings = {
  weeklyBudget: 25000, // $250.00 in cents
  weekStartDay: 1, // Monday
};

export async function getSettings(userId: string): Promise<UserSettings> {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snapshot = await getDoc(settingsRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as Partial<UserSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...data,
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
  await setDoc(settingsRef, updates, { merge: true });
  // Return the updated settings
  return getSettings(userId);
}
