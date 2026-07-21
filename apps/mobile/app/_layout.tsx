import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { RealmProvider } from '@realm/react';
import { realmConfig } from '@/db/realm';
import { useApiConfigStore } from '@/features/api-config/store';
import { ApiConfigScreen } from '@/features/api-config/ApiConfigScreen';
import { initNetworkMonitor, subscribeNetwork, checkHealth } from '@/core/network/networkMonitor';
import { syncService } from '@/services/sync.service';

export default function RootLayout() {
  const { loadConfig, isConfigured } = useApiConfigStore();

  useEffect(() => {
    loadConfig();

    initNetworkMonitor();
    const unsubscribe = subscribeNetwork(async online => {
      if (online) {
        const healthy = await checkHealth();
        if (healthy) {
          syncService.triggerSync();
        }
      }
    });

    return () => unsubscribe();
  }, [loadConfig]);

  return (
    <RealmProvider {...realmConfig}>{isConfigured ? <Slot /> : <ApiConfigScreen />}</RealmProvider>
  );
}
