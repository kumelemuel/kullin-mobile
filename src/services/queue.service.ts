import { getRealm, writeRealm } from '@/db/realm';
import { PendingOperation, OperationType, OperationStatus } from '@/db/models/PendingOperation';

export interface QueuedOperation {
  _id: string;
  type: OperationType;
  endpoint: string;
  payload: any; // parsed JSON
  timestamp: number;
  retries: number;
  status: OperationStatus;
  lastError?: string;
  entityType?: string;
  entityId?: string;
}

export interface QueueOperation {
  type: OperationType;
  endpoint: string;
  payload: any;
  entityType?: string;
  entityId?: string;
}

export class QueueService {
  private realm = getRealm();

  enqueue(operation: QueueOperation): string {
    const id = writeRealm((realm) => {
      const pendingOp = realm.create<PendingOperation>('PendingOperation', {
        _id: new realm.BSON.ObjectId(),
        type: operation.type,
        endpoint: operation.endpoint,
        payload: JSON.stringify(operation.payload),
        timestamp: Date.now(),
        retries: 0,
        status: OperationStatus.PENDING,
        entityType: operation.entityType,
        entityId: operation.entityId,
      });
      return pendingOp._id.toHexString();
    });
    return id!;
  }

  getPending(): QueuedOperation[] {
    const results = this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('status == $0', OperationStatus.PENDING)
      .sorted('timestamp', true);
    return Array.from(results).map(this.mapOperation);
  }

  getSyncing(): QueuedOperation[] {
    const results = this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('status == $0', OperationStatus.SYNCING);
    return Array.from(results).map(this.mapOperation);
  }

  getFailed(): QueuedOperation[] {
    const results = this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('status == $0', OperationStatus.FAILED);
    return Array.from(results).map(this.mapOperation);
  }

  getPendingCount(): number {
    return this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('status == $0', OperationStatus.PENDING).length;
  }

  markSyncing(id: string): void {
    writeRealm((realm) => {
      const obj = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', new realm.BSON.ObjectId(id));
      if (obj) {
        obj.status = OperationStatus.SYNCING;
      }
    });
  }

  markSynced(id: string): void {
    writeRealm((realm) => {
      const obj = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', new realm.BSON.ObjectId(id));
      if (obj) {
        obj.status = OperationStatus.SYNCED;
      }
    });
  }

  markFailed(id: string, error: string): void {
    writeRealm((realm) => {
      const obj = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', new realm.BSON.ObjectId(id));
      if (obj) {
        obj.status = OperationStatus.FAILED;
        obj.lastError = error;
      }
    });
  }

  incrementRetries(id: string, error: string): void {
    writeRealm((realm) => {
      const obj = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', new realm.BSON.ObjectId(id));
      if (obj) {
        obj.retries += 1;
        obj.lastError = error;
        obj.status = OperationStatus.PENDING;
      }
    });
  }

  deleteSynced(): number {
    return writeRealm((realm) => {
      const synced = realm
        .objects<PendingOperation>('PendingOperation')
        .filtered('status == $0', OperationStatus.SYNCED);
      const count = synced.length;
      realm.delete(synced);
      return count;
    })!;
  }

  clearAll(): void {
    writeRealm((realm) => {
      const all = realm.objects<PendingOperation>('PendingOperation');
      realm.delete(all);
    });
  }

  private mapOperation(op: PendingOperation): QueuedOperation {
    return {
      _id: op._id.toHexString(),
      type: op.type,
      endpoint: op.endpoint,
      payload: JSON.parse(op.payload),
      timestamp: op.timestamp,
      retries: op.retries,
      status: op.status,
      lastError: op.lastError,
      entityType: op.entityType,
      entityId: op.entityId,
    };
  }
}

export const queueService = new QueueService();