import Realm from 'realm';

export class ApiConfig extends Realm.Object<ApiConfig> {
  _id!: Realm.BSON.ObjectId;
  url!: string;
  port!: number;
  token!: string;
  updatedAt!: number;

  static schema: Realm.ObjectSchema = {
    name: 'ApiConfig',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      url: 'string',
      port: 'int',
      token: 'string',
      updatedAt: 'int',
    },
  };
}

export const ApiConfigSchema = ApiConfig.schema;
