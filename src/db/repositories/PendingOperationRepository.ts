import { getRealm, writeRealm } from '../realm';
import { PendingOperation, OperationType, OperationStatus } from '../models/PendingOperation';

export class PendingOperationRepository {
  private realm = getRealm();

  getAllPending(): PendingOperation[] {
    return Array.from(
      this.realm
        .objects<PendingOperation>('PendingOperation')
        .filtered('status == $0', OperationStatus.PENDING)
        .sorted('timestamp', true)
    );
  }

  getByStatus(status: OperationStatus): PendingOperation[] {
    return Array.from(
      this.realm.objects<PendingOperation>('PendingOperation').filtered('status == $0', status)
    );
  }

  getByEntity(entityType: string, entityId: string): PendingOperation | null {
    const results = this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('entityType == $0 AND entityId == $1', entityType, entityId);
    return results.length > 0 ? results[0] : null;
  }

  countPending(): number {
    return this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('status == $0', OperationStatus.PENDING).length;
  }

  create(operation: Omit<PendingOperation, '_id'>): PendingOperation {
    return writeRealm((realm) => {
      return realm.create<PendingOperation>('PendingOperation', {
        _id: new Realm.BSON.ObjectId(),
        ...operation,
        timestamp: Date.now(),
        retries: 0,
        status: OperationStatus.PENDING,
      });
    });
  }

  updateStatus(id: Realm.BSON.ObjectId, status: OperationStatus, error?: string): void {
    writeRealm((realm) => {
      const op = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', id);
      if (op) {
        op.status = status;
        if (error) op.lastError = error;
        if (status === OperationStatus.SYNCING) op.retries += 1;
      }
    });
  }

  incrementRetries(id: Realm.BSON.ObjectId, error: string): void {
    writeRealm((realm) => {
      const op = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', id);
      if (op) {
        op.retries += 1;
        op.lastError = error;
        op.status = OperationStatus.PENDING;
      }
    });
  }

  markSynced(id: Realm.BSON.ObjectId): void {
    writeRealm((realm) => {
      const op = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', id);
      if (op) {
        op.status = OperationStatus.SYNCED;
      }
    });
  }

  markFailed(id: Realm.BSON.ObjectId, error: string): void {
    writeRealm((realm) => {
      const op = realm.objectForPrimaryKey<PendingOperation>('PendingOperation', id);
      if (op) {
        op.status = OperationStatus.FAILED;
        op.lastError = error;
      }
    });
  }

  deleteSynced(): number {
    let count = 0;
    writeRealm((realm) => {
      const synced = realm.objects<PendingOperation>('PendingOperation').filtered('status == $0', OperationStatus.SYNCED);
      count = synced.length;
      realm.delete(synced);
    });
    return count;
  }

  subscribe(callback: (operations: PendingOperation[]) => void): () => void {
    const collection = this.realm
      .objects<PendingOperation>('PendingOperation')
      .filtered('status == $0', OperationStatus.PENDING);
    const listener = () => callback(Array.from(collection));
    collection.addListener(listener);
    listener(); // initial
    return () => collection.removeListener(listener);
  }
}

export const pendingOperationRepository = new PendingOperationRepository();