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
    // Create a type-safe update function
    const updateState = (state: SettingsStore) => {
      const newState = { ...state };
      (newState as any)[key] = value;
      return newState;
    };
    
    set(updateState);

    try {
      // Get the current state after update
      const currentState = get();
      
      // Extract only the settings properties for storage
      const settingsToSave: Settings = {
        theme: currentState.theme,
        hapticFeedback: currentState.hapticFeedback,
        defaultForegroundColor: currentState.defaultForegroundColor,
        defaultBackgroundColor: currentState.defaultBackgroundColor,
        defaultSize: currentState.defaultSize,
        defaultErrorCorrection: currentState.defaultErrorCorrection,
        autoSaveToGallery: currentState.autoSaveToGallery,
      };
      
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
        const settings: Partial<Settings> = JSON.parse(storedSettings);
        // Merge with current state to preserve any new settings that might not be in storage
        set((state) => ({ ...state, ...settings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  resetSettings: async () => {
    set((state) => ({ ...state, ...DEFAULT_SETTINGS }));
    
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  },
}));