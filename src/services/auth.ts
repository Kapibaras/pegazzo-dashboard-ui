import AbstractUnauthedAPIService from './base/AbstractUnauthedAPIService';
import { AxiosResponse } from 'axios';
import { ScopedAPIClient } from '@/api';

export default class AuthService extends AbstractUnauthedAPIService {
  private extractSetCookiesHeaders(res: AxiosResponse<unknown>): string[] {
    const headersWithCookies = res.headers['set-cookie'];
    if (!headersWithCookies) return [];
    return Array.isArray(headersWithCookies) ? headersWithCookies : [headersWithCookies];
  }

  async login(credentials: { username: string; password: string }): Promise<{
    access_token: string;
    refresh_token: string;
    setCookiesHeaders: string[];
  }> {
    const res = await this.client.post<{
      access_token: string;
      refresh_token: string;
    }>('/internal/auth/login', credentials, { withCredentials: true });

    const setCookiesHeaders = this.extractSetCookiesHeaders(res);

    if (this.client instanceof ScopedAPIClient) {
      this.client.updateCookies(setCookiesHeaders);
    }

    return { ...res.data, setCookiesHeaders };
  }

  async refresh(): Promise<{
    access_token: string;
    refresh_token: string;
    setCookiesHeaders: string[];
  }> {
    const res = await this.client.post<{
      access_token: string;
      refresh_token: string;
    }>('/internal/auth/refresh', undefined, { withCredentials: true });

    const setCookiesHeaders = this.extractSetCookiesHeaders(res);

    if (this.client instanceof ScopedAPIClient) {
      this.client.updateCookies(setCookiesHeaders);
    }

    return { ...res.data, setCookiesHeaders };
  }

  async logout(): Promise<{ message: string; setCookiesHeaders: string[] }> {
    const res = await this.client.post<{ message: string }>('/internal/auth/logout', undefined, {
      withCredentials: true,
    });

    const setCookiesHeaders = this.extractSetCookiesHeaders(res);

    if (this.client instanceof ScopedAPIClient) {
      this.client.clearCookies();
    }

    return { ...res.data, setCookiesHeaders };
  }
}
