import axios from "axios";
import APIClientBase from "./base";
import CONFIG from "@/config";
import { APIError, APIRequestFailed } from "../index";
import getCookie from "@/utils/getCookie";
import getCookiesClient from "@/utils/getCookiesClient";

export default class SingletonAPIClient extends APIClientBase {
  private static instance: SingletonAPIClient;

  private constructor() {
    const axiosInstance = axios.create({
      baseURL: CONFIG.BASE_URL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    super(axiosInstance);

    this.getRawAxiosInstance().interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
          console.debug("[API] request canceled:", error.message);
          return;
        }
        if (error.response) {
          const status = error.response.status;
          const message =
            error.response.data?.detail ||
            error.response.statusText ||
            "Server error";
          return Promise.reject(new APIError(message, status));
        }
        return Promise.reject(
          new APIRequestFailed(error.message || "Request failed", 500)
        );
      }
    );

    this.getRawAxiosInstance().interceptors.request.use((config) => {
      const cookiesClient = getCookiesClient();
      const csrfAccess = getCookie(cookiesClient, "csrf_access_token");
      const csrfRefresh = getCookie(cookiesClient, "csrf_refresh_token");

      if (csrfAccess) {
        config.headers["X-CSRF-ACCESS"] = csrfAccess;
      }
      if (csrfRefresh) {
        config.headers["X-CSRF-REFRESH"] = csrfRefresh;
      }
      return config;
    });
  }

  public static getInstance(): SingletonAPIClient {
    if (!SingletonAPIClient.instance) {
      SingletonAPIClient.instance = new SingletonAPIClient();
    }
    return SingletonAPIClient.instance;
  }
}
