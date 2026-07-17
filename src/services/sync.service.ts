import { apiClient } from '@/core/api/client';
import { queueService, QueueOperation } from '@/services/queue.service';
import { checkHealth, getNetworkStatus } from '@/core/network/networkMonitor';

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

function calculateBackoff(attempt: number): number {
  const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
  const jitter = Math.random() * 1000;
  return delay + jitter;
}

async function executeOperation(operation: QueueOperation): Promise<void> {
  const { type, endpoint, payload } = operation;

  switch (type) {
    case 'create':
      await apiClient.post(endpoint, payload);
      break;
    case 'update':
      await apiClient.put(endpoint, payload);
      break;
    case 'delete':
      await apiClient.delete(endpoint);
      break;
    default:
      throw new Error(`Unknown operation type: ${type}`);
  }
}

export class SyncService {
  private isProcessing = false;
  private listeners: Array<(status: SyncStatus) => void> = [];
  private currentStatus: SyncStatus = {
    isSyncing: false,
    pendingCount: 0,
    lastSync: null,
    error: null,
  };

  getStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(status: Partial<SyncStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...status };
    this.listeners.forEach((listener) => listener(this.currentStatus));
  }

  async processQueue(): Promise<SyncResult> {
    if (this.isProcessing) {
      return { success: false, synced: 0, failed: 0, error: 'Already processing' };
    }

    if (!getNetworkStatus()) {
      return { success: false, synced: 0, failed: 0, error: 'Offline' };
    }

    const healthy = await checkHealth();
    if (!healthy) {
      return { success: false, synced: 0, failed: 0, error: 'Health check failed' };
    }

    this.isProcessing = true;
    this.notify({ isSyncing: true, error: null });

    const pending = queueService.getPending();
    let synced = 0;
    let failed = 0;

    for (const operation of pending) {
      if (!getNetworkStatus()) {
        this.notify({ error: 'Went offline during sync' });
        break;
      }

      queueService.markSyncing(operation._id);

      try {
        await executeOperation({
          type: operation.type,
          endpoint: operation.endpoint,
          payload: operation.payload,
        });
        queueService.markSynced(operation._id);
        synced++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (operation.retries >= MAX_RETRIES) {
          queueService.markFailed(operation._id, errorMessage);
          failed++;
        } else {
          queueService.incrementRetries(operation._id, errorMessage);
          await new Promise((resolve) => setTimeout(resolve, calculateBackoff(operation.retries)));
        }
      }

      this.notify({ pendingCount: queueService.getPendingCount() });
    }

    this.isProcessing = false;
    this.notify({
      isSyncing: false,
      lastSync: Date.now(),
      pendingCount: queueService.getPendingCount(),
      error: failed > 0 ? `${failed} operations failed` : null,
    });

    if (synced > 0) {
      queueService.deleteSynced();
    }

    return { success: failed === 0, synced, failed, error: failed > 0 ? 'Some operations failed' : null };
  }

  async triggerSync(): Promise<SyncResult> {
    return this.processQueue();
  }
}

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSync: number | null;
  error: string | null;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  error: string | null;
}

export const syncService = new SyncService();