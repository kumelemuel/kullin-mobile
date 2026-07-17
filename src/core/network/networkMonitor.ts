import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { apiClient } from '@/core/api/client';

let isOnline = false;
let listeners: Array<(online: boolean) => void> = [];
let healthCheckPromise: Promise<boolean> | null = null;

export function getNetworkStatus(): boolean {
  return isOnline;
}

export function subscribeNetwork(listener: (online: boolean) => void): () => void {
  listeners.push(listener);
  listener(isOnline);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notifyListeners(): void {
  listeners.forEach(listener => listener(isOnline));
}

export function initNetworkMonitor(): void {
  NetInfo.addEventListener((state: NetInfoState) => {
    const wasOnline = isOnline;
    isOnline = state.isConnected === true && state.isInternetReachable !== false;
    if (wasOnline !== isOnline) {
      notifyListeners();
    }
  });
}

export async function checkHealth(): Promise<boolean> {
  if (healthCheckPromise) {
    return healthCheckPromise;
  }

  healthCheckPromise = (async () => {
    try {
      const response = await apiClient.get('/api/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    } finally {
      healthCheckPromise = null;
    }
  })();

  return healthCheckPromise;
}
