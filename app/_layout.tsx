import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { Providers } from '@realm/react';
import { startNetworkMonitoring, checkHealth } from '@/core/network/networkMonitor';
import { syncService } from '@/services/sync.service';
import { useApiConfigStore } from '@/features/api-config/store';
import { ApiConfigScreen } from '@/features/api-config/ApiConfigScreen';

export default function RootLayout() {
  const { loadConfig, isConfigured } = useApiConfigStore();

  useEffect(() => {
    loadConfig();

    // Initialize network monitoring
    const unsubscribe = startNetworkMonitoring();

    // Listen for online events to trigger sync
    const handleOnline = async () => {
      const healthy = await checkHealth();
      if (healthy) {
        syncService.triggerSync();
      }
    };

    // We can't easily subscribe to network changes here without a hook
    // The sync trigger will happen via the SyncProvider in the app

    return unsubscribe;
  }, [loadConfig]);

  // Show config screen if not configured
  if (!isConfigured) {
    return (
      <Providers>
        <ApiConfigScreen />
      </Providers>
    );
  }

  return (
    <Providers>
      <Slot />
    </Providers>
  );
}