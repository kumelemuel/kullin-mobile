import Realm from 'realm';
import { ApiConfig } from '../models/ApiConfig';
import { realmWrite, getRealm } from '../realm';

export class ApiConfigRepository {
  private get realm(): Realm {
    return getRealm();
  }

  getConfig(): ApiConfig | null {
    const configs = this.realm.objects<ApiConfig>('ApiConfig');
    return configs.length > 0 ? configs[0] : null;
  }

  async setConfig(url: string, port: number, token: string): Promise<ApiConfig> {
    return realmWrite((realm) => {
      const existing = this.getConfig();
      if (existing) {
        existing.url = url;
        existing.port = port;
        existing.token = token;
        existing.updatedAt = Date.now();
        return existing;
      } else {
        return realm.create<ApiConfig>('ApiConfig', {
          _id: new Realm.BSON.ObjectId(),
          url,
          port,
          token,
          updatedAt: Date.now(),
        });
      }
    });
  }

  async clearConfig(): Promise<void> {
    return realmWrite((realm) => {
      const configs = realm.objects<ApiConfig>('ApiConfig');
      if (configs.length > 0) {
        realm.delete(configs);
      }
    });
  }

  getBaseUrl(): string | null {
    const config = this.getConfig();
    if (!config) return null;
    return `${config.url}:${config.port}`;
  }

  getToken(): string | null {
    const config = this.getConfig();
    return config?.token ?? null;
  }

  isConfigured(): boolean {
    return this.getConfig() !== null;
  }
}

export const apiConfigRepository = new ApiConfigRepository();