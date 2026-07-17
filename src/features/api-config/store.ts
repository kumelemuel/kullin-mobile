import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetApiClient } from '@/core/api/client';
import { apiConfigRepository } from '@/db/repositories/ApiConfigRepository';

interface ApiConfig {
  url: string;
  port: number;
  token: string;
}

interface ApiConfigState {
  config: ApiConfig | null;
  isConfigured: boolean;
  setConfig: (config: ApiConfig) => Promise<void>;
  clearConfig: () => Promise<void>;
  loadConfig: () => void;
}

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    set => ({
      config: null,
      isConfigured: false,
      setConfig: async (config: ApiConfig) => {
        await apiConfigRepository.setConfig(config.url, config.port, config.token);
        set({ config, isConfigured: true });
        resetApiClient();
      },
      clearConfig: async () => {
        await apiConfigRepository.clearConfig();
        set({ config: null, isConfigured: false });
        resetApiClient();
      },
      loadConfig: () => {
        const config = apiConfigRepository.getConfig();
        if (config) {
          set({ config, isConfigured: true });
          resetApiClient();
        }
      },
    }),
    {
      name: 'api-config-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ isConfigured: state.isConfigured }),
    }
  )
);
