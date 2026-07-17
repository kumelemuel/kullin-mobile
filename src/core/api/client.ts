import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfigStore } from '@/features/api-config/store';

let apiClientInstance: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClientInstance) {
    const config = apiConfigStore.getState();
    const baseURL = `http://${config.url}:${config.port}`;

    apiClientInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    apiClientInstance.interceptors.request.use(
      (request: InternalAxiosRequestConfig) => {
        const token = apiConfigStore.getState().token;
        if (token && request.headers) {
          request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
      },
      (error) => Promise.reject(error)
    );

    apiClientInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token invalid/expired - clear config and trigger re-configuration
          apiConfigStore.getState().clearConfig();
        }
        return Promise.reject(error);
      }
    );
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