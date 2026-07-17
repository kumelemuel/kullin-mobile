import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useApiConfigStore } from '@/features/api-config/store';

let apiClientInstance: AxiosInstance | null = null;

function getApiClient(): AxiosInstance {
  if (!apiClientInstance) {
    const config = useApiConfigStore.getState().config;
    const baseURL = config ? `http://${config.url}:${config.port}` : '';

    apiClientInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    apiClientInstance.interceptors.request.use(
      (request: InternalAxiosRequestConfig) => {
        const token = useApiConfigStore.getState().config?.token;
        if (token && request.headers) {
          request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
      },
      error => Promise.reject(error)
    );

    apiClientInstance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          useApiConfigStore.getState().clearConfig();
        }
        return Promise.reject(error);
      }
    );
  }

  const config = useApiConfigStore.getState().config;
  const newBaseURL = config ? `http://${config.url}:${config.port}` : '';
  if (apiClientInstance && apiClientInstance.defaults.baseURL !== newBaseURL) {
    apiClientInstance = null;
    return getApiClient();
  }

  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}

export const apiClient = {
  get: <T>(url: string, config?: any) => getApiClient().get<T>(url, config),
  post: <T>(url: string, data?: any, config?: any) => getApiClient().post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: any) => getApiClient().put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: any) => getApiClient().patch<T>(url, data, config),
  delete: <T>(url: string, config?: any) => getApiClient().delete<T>(url, config),
};
