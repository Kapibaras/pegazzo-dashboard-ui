import { AxiosError } from 'axios';
import APIClientBase from '@/api/clients/base';
import { APIRequestFailed } from '@/api/errors';
import AuthService from '../auth';

export default abstract class AbstractAPIService {
  protected readonly client: APIClientBase;
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  constructor(client: APIClientBase) {
    this.client = client;

    const axiosInstance = this.client.getRawAxiosInstance();

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const isRefreshRequest = error.config?.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !isRefreshRequest) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;

            const authService = new AuthService(this.client);
            this.refreshPromise = authService.refresh().finally(() => {
              this.isRefreshing = false;
              this.refreshPromise = null;
            });
          }

          try {
            await this.refreshPromise;

            if (!error.config) return Promise.reject(error);
            return axiosInstance.request({ ...error.config, headers: undefined });
          } catch {
            return Promise.reject(new APIRequestFailed('Session expired', 401, 'SESSION_EXPIRED'));
          }
        }

        return Promise.reject(error);
      },
    );
  }
}
