import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfigRepository } from '@/db/repositories/ApiConfigRepository';

interface ApiConfigState {
  url: string;
  port: number;
  token: string;
  isConfigured: boolean;
  setConfig: (url: string, port: number, token: string) => Promise<void>;
  clearConfig: () => Promise<void>;
  loadConfig: () => void;
}

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set, get) => ({
      url: '',
      port: 0,
      token: '',
      isConfigured: false,
      setConfig: async (url: string, port: number, token: string) => {
        await apiConfigRepository.setConfig(url, port, token);
        set({ url, port, token, isConfigured: true });
      },
      clearConfig: async () => {
        await apiConfigRepository.clearConfig();
        set({ url: '', port: 0, token: '', isConfigured: false });
      },
      loadConfig: () => {
        const config = apiConfigRepository.getConfig();
        if (config) {
          set({ url: config.url, port: config.port, token: config.token, isConfigured: true });
        }
      },
    }),
    {
      name: 'api-config-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isConfigured: state.isConfigured }),
    }
  )
);