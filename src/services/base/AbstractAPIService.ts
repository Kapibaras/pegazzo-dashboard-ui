import { AxiosError } from "axios";
import APIClientBase from "@/api/clients/base";
import AuthService from "../auth";

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
        if (error.response?.status === 401) {
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
            return axiosInstance.request(error.config);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}
