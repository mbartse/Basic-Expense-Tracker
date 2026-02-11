import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getSettings,
  updateSettings as updateSettingsService,
  DEFAULT_SETTINGS,
} from '../services/settingsService';
import type { UserSettings } from '../types/settings';

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    try {
      const userSettings = await getSettings(user.uid);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    // Optimistically update local state
    setSettings(prev => ({ ...prev, ...updates }));

    try {
      const newSettings = await updateSettingsService(user.uid, updates);
      setSettings(newSettings);
    } catch (error) {
      // Revert on error
      console.error('Error saving settings:', error);
      await refreshSettings();
    }
  };

  const value: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
