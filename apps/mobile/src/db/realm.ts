import Realm from 'realm';
import { PendingOperationSchema } from './models/PendingOperation';
import { ApiConfigSchema } from './models/ApiConfig';

let realmInstance: Realm | null = null;

export const realmConfig: Realm.Configuration = {
  schema: [PendingOperationSchema, ApiConfigSchema],
  schemaVersion: 1,
  onMigration: () => {
    // Future migrations go here
  },
};

export function getRealm(): Realm {
  if (!realmInstance) {
    realmInstance = new Realm(realmConfig);
  }
  return realmInstance;
}

export function closeRealm(): void {
  if (realmInstance) {
    realmInstance.close();
    realmInstance = null;
  }
}

export function writeRealm<T>(callback: (realm: Realm) => T): T {
  const realm = getRealm();
  let result: T;
  realm.write(() => {
    result = callback(realm);
  });
  return result!;
}
