import axios from "axios";
import APIClientBase from "./base";
import CONFIG from "@/config";
import { APIError, APIRequestFailed } from "../index";
import { getCookieFromHeader } from "@/api/helpers";

export default class ScopedAPIClient extends APIClientBase {
  constructor(cookieHeader: string | undefined) {
    const csrfAccess = getCookieFromHeader(cookieHeader, "csrf_access_token");
    const csrfRefresh = getCookieFromHeader(cookieHeader, "csrf_refresh_token");

    const axiosInstance = axios.create({
      baseURL: CONFIG.BASE_URL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader || "",
        ...(csrfAccess ? { "X-CSRF-ACCESS": csrfAccess } : {}),
        ...(csrfRefresh ? { "X-CSRF-REFRESH": csrfRefresh } : {}),
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
            error.response.data?.message ||
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
