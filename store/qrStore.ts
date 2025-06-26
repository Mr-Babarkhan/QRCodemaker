import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCode, QRType, ErrorCorrectionLevel } from '@/types/qr';

interface QRStore {
  qrCodes: QRCode[];
  favorites: QRCode[];
  recentQRCodes: QRCode[];
  isLoading: boolean;
  
  // Actions
  addQRCode: (qrCode: Omit<QRCode, 'id' | 'createdAt'>) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteQRCode: (id: string) => Promise<void>;
  loadQRCodes: () => Promise<void>;
  searchQRCodes: (query: string) => QRCode[];
  filterByType: (type: QRType | 'all') => QRCode[];
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = 'qr_codes';

export const useQRStore = create<QRStore>((set, get) => ({
  qrCodes: [],
  favorites: [],
  recentQRCodes: [],
  isLoading: false,

  addQRCode: async (qrCodeData) => {
    const newQRCode: QRCode = {
      ...qrCodeData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedQRCodes = [newQRCode, ...get().qrCodes];
    
    set({
      qrCodes: updatedQRCodes,
      recentQRCodes: updatedQRCodes.slice(0, 5),
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQRCodes));
    } catch (error) {
      console.error('Failed to save QR code:', error);
    }
  },

  toggleFavorite: async (id) => {
    const qrCodes = get().qrCodes.map(qr => 
      qr.id === id ? { ...qr, isFavorite: !qr.isFavorite } : qr
    );
    
    const favorites = qrCodes.filter(qr => qr.isFavorite);
    
    set({ qrCodes, favorites });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(qrCodes));
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  },

  deleteQRCode: async (id) => {
    const qrCodes = get().qrCodes.filter(qr => qr.id !== id);
    const favorites = qrCodes.filter(qr => qr.isFavorite);
    
    set({ 
      qrCodes, 
      favorites,
      recentQRCodes: qrCodes.slice(0, 5),
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(qrCodes));
    } catch (error) {
      console.error('Failed to delete QR code:', error);
    }
  },

  loadQRCodes: async () => {
    set({ isLoading: true });
    
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const qrCodes: QRCode[] = JSON.parse(storedData).map((qr: any) => ({
          ...qr,
          createdAt: new Date(qr.createdAt),
        }));
        
        const favorites = qrCodes.filter(qr => qr.isFavorite);
        
        set({
          qrCodes,
          favorites,
          recentQRCodes: qrCodes.slice(0, 5),
        });
      }
    } catch (error) {
      console.error('Failed to load QR codes:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  searchQRCodes: (query) => {
    const { qrCodes } = get();
    if (!query.trim()) return qrCodes;
    
    return qrCodes.filter(qr => 
      qr.title.toLowerCase().includes(query.toLowerCase()) ||
      qr.data.toLowerCase().includes(query.toLowerCase())
    );
  },

  filterByType: (type) => {
    const { qrCodes } = get();
    if (type === 'all') return qrCodes;
    
    return qrCodes.filter(qr => qr.type === type);
  },

  clearHistory: async () => {
    set({ qrCodes: [], favorites: [], recentQRCodes: [] });
    
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },
}));