import Realm from 'realm';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum OperationStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
}

export class PendingOperation extends Realm.Object<PendingOperation> {
  _id!: Realm.BSON.ObjectId;
  type!: OperationType;
  endpoint!: string;
  payload!: string; // JSON stringified
  entityType?: string;
  entityId?: string;
  timestamp!: number;
  retries!: number;
  status!: OperationStatus;
  lastError?: string;

  static schema: Realm.ObjectSchema = {
    name: 'PendingOperation',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      type: 'string',
      endpoint: 'string',
      payload: 'string',
      entityType: { type: 'string', optional: true },
      entityId: { type: 'string', optional: true },
      timestamp: 'int',
      retries: 'int',
      status: 'string',
      lastError: { type: 'string', optional: true },
    },
  };
}

export const PendingOperationSchema = PendingOperation.schema;
