import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorCorrectionLevel } from '@/types/qr';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  hapticFeedback: boolean;
  defaultForegroundColor: string;
  defaultBackgroundColor: string;
  defaultSize: number;
  defaultErrorCorrection: ErrorCorrectionLevel;
  autoSaveToGallery: boolean;
}

interface SettingsStore extends Settings {
  isLoading: boolean;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  hapticFeedback: true,
  defaultForegroundColor: '#000000',
  defaultBackgroundColor: '#FFFFFF',
  defaultSize: 200,
  defaultErrorCorrection: 'M',
  autoSaveToGallery: false,
};

const SETTINGS_KEY = 'app_settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoading: false,

  updateSetting: async (key, value) => {
    const newSettings = { ...get(), [key]: value };
    set({ [key]: value } as any);

    try {
      const settingsToSave = Object.keys(DEFAULT_SETTINGS).reduce((acc, k) => {
        acc[k as keyof Settings] = newSettings[k as keyof Settings];
        return acc;
      }, {} as Settings);
      
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  loadSettings: async () => {
    set({ isLoading: true });
    
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        set({ ...settings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  resetSettings: async () => {
    set({ ...DEFAULT_SETTINGS });
    
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  },
}));