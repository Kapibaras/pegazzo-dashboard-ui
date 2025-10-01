import axios from "axios";
import APIClientBase from "./base";
import CONFIG from "@/config";
import { APIError, APIRequestFailed } from "../index";
import { getCookieFromHeader } from "@/api/helpers";

export default class ScopedAPIClient extends APIClientBase {
  constructor(cookieHeader?: string) {
    
    const csrfAccess = getCookieFromHeader(cookieHeader, "csrf_access_token");
    const csrfRefresh = getCookieFromHeader(cookieHeader, "csrf_refresh_token");

    const csrfHeaders: Record<string, string> = {};
    if (csrfAccess) {
      csrfHeaders["X-CSRF-ACCESS"] = csrfAccess;
    }
    if (csrfRefresh) {
      csrfHeaders["X-CSRF-REFRESH"] = csrfRefresh;
    }
    
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...csrfHeaders,
      
      ...(cookieHeader ? { Cookie: cookieHeader } : {}), 
    };

    const axiosInstance = axios.create({
      baseURL: CONFIG.BASE_URL,
      headers,
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
  }
}
