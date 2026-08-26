import axios from 'axios';
import APIClientBase from './base';
import CONFIG from '@/config';
import { APIError, APIRequestFailed } from '../index';
import { getCookie } from '@/utils/cookies';

export default class ScopedAPIClient extends APIClientBase {
  private cookies: string;

  constructor(initialCookies?: string) {
    super(
      axios.create({
        baseURL: CONFIG.BASE_URL,
        headers: ScopedAPIClient.buildHeaders(initialCookies),
        withCredentials: true,
      }),
    );

    this.cookies = initialCookies ?? '';

    this.getRawAxiosInstance().interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
          console.debug('[API] request canceled:', error.message);
          return;
        }
        if (error.response?.status === 401) {
          return Promise.reject(error);
        }
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.detail || error.response.statusText || 'Server error';
          return Promise.reject(new APIError(message, status));
        }
        return Promise.reject(new APIRequestFailed(error.message || 'Request failed', 500));
      },
    );
  }

  private static buildHeaders(cookies?: string) {
    const csrfAccess = getCookie(cookies ?? '', 'csrf_access_token');
    const csrfRefresh = getCookie(cookies ?? '', 'csrf_refresh_token');

    const csrfHeaders: Record<string, string> = {};
    if (csrfAccess) csrfHeaders['X-CSRF-ACCESS'] = csrfAccess;
    if (csrfRefresh) csrfHeaders['X-CSRF-REFRESH'] = csrfRefresh;

    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...csrfHeaders,
      ...(cookies ? { Cookie: cookies } : {}),
    };
  }

  updateCookies(newCookies: string[]) {
    this.cookies = newCookies.join('; ');
    this.getRawAxiosInstance().defaults.headers.Cookie = this.cookies;
    const csrfAccess = getCookie(this.cookies, 'csrf_access_token');
    const csrfRefresh = getCookie(this.cookies, 'csrf_refresh_token');
    if (csrfAccess) this.getRawAxiosInstance().defaults.headers['X-CSRF-ACCESS'] = csrfAccess;
    if (csrfRefresh) this.getRawAxiosInstance().defaults.headers['X-CSRF-REFRESH'] = csrfRefresh;
  }

  clearCookies() {
    this.cookies = '';
    this.getRawAxiosInstance().defaults.headers.Cookie = '';
    delete this.getRawAxiosInstance().defaults.headers['X-CSRF-ACCESS'];
    delete this.getRawAxiosInstance().defaults.headers['X-CSRF-REFRESH'];
  }

  getCookies() {
    return this.cookies;
  }
}
