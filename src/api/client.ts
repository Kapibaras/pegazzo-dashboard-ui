import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { APIError, APIRequestFailed } from "./index";
import CONFIG from "../config";

export class APIClient {
  private static instance: APIClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: CONFIG.BASE_URL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
            console.debug("[API] request canceled:", error.message);
            return;
        }
        if (error.response) {
            const status = error.response.status;
            const message =
              error.response.data?.message ||
              error.response.statusText ||
              "Server error";
            return Promise.reject(new APIError(message, status));
        }
        return Promise.reject(
            new APIRequestFailed(error.message || "Request failed", 500)
        );   
      },
    );
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

