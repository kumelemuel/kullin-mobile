import Realm from 'realm';
import { getRealm, writeRealm } from '@/db/realm';
import { PendingOperation, OperationType, OperationStatus } from '@/db/models/PendingOperation';

export interface QueuedOperation {
  _id: string;
  type: OperationType;
  endpoint: string;
  payload: any;
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
  private get realm(): Realm {
    return getRealm();
  }

  enqueue(operation: QueueOperation): string {
    return writeRealm(realm => {
      const pendingOp = realm.create<PendingOperation>('PendingOperation', {
        _id: new Realm.BSON.ObjectId(),
        type: operation.type,
        endpoint: operation.endpoint,
        payload: JSON.stringify(operation.payload),
        entityType: operation.entityType,
        entityId: operation.entityId,
        timestamp: Date.now(),
        retries: 0,
        status: OperationStatus.PENDING,
        lastError: '',
      });
      return pendingOp._id.toHexString();
    });
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
    writeRealm(realm => {
      const obj = realm.objectForPrimaryKey<PendingOperation>(
        'PendingOperation',
        new Realm.BSON.ObjectId(id)
      );
      if (obj) {
        obj.status = OperationStatus.SYNCING;
      }
    });
  }

  markSynced(id: string): void {
    writeRealm(realm => {
      const obj = realm.objectForPrimaryKey<PendingOperation>(
        'PendingOperation',
        new Realm.BSON.ObjectId(id)
      );
      if (obj) {
        obj.status = OperationStatus.SYNCED;
      }
    });
  }

  markFailed(id: string, error: string): void {
    writeRealm(realm => {
      const obj = realm.objectForPrimaryKey<PendingOperation>(
        'PendingOperation',
        new Realm.BSON.ObjectId(id)
      );
      if (obj) {
        obj.status = OperationStatus.FAILED;
        obj.lastError = error;
      }
    });
  }

  incrementRetries(id: string, error: string): void {
    writeRealm(realm => {
      const obj = realm.objectForPrimaryKey<PendingOperation>(
        'PendingOperation',
        new Realm.BSON.ObjectId(id)
      );
      if (obj) {
        obj.retries += 1;
        obj.lastError = error;
        obj.status = OperationStatus.PENDING;
      }
    });
  }

  deleteSynced(): number {
    return writeRealm(realm => {
      const synced = realm
        .objects<PendingOperation>('PendingOperation')
        .filtered('status == $0', OperationStatus.SYNCED);
      const count = synced.length;
      realm.delete(synced);
      return count;
    })!;
  }

  clearAll(): void {
    writeRealm(realm => {
      const all = realm.objects<PendingOperation>('PendingOperation');
      realm.delete(all);
    });
  }

  subscribeToPending(callback: (operations: QueuedOperation[]) => void): () => void {
    const collection = this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('status == $0', OperationStatus.PENDING);
    const listener = () => callback(Array.from(collection).map(this.mapOperation));
    collection.addListener(listener);
    listener();
    return () => collection.removeListener(listener);
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
