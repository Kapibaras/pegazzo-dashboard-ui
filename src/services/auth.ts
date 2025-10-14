import AbstractUnauthedAPIService from './base/AbstractUnauthedAPIService';
import { AxiosResponse } from 'axios';
import { ScopedAPIClient } from '@/api';

export default class AuthService extends AbstractUnauthedAPIService {
  private extractSetCookies(res: AxiosResponse<unknown>): string[] {
    const setCookies = res.headers['set-cookie'];
    if (!setCookies) return [];
    return Array.isArray(setCookies) ? setCookies : [setCookies];
  }

  async login(credentials: { username: string; password: string }): Promise<{
    access_token: string;
    refresh_token: string;
    setCookies: string[];
  }> {
    const res = await this.client.post<{
      access_token: string;
      refresh_token: string;
    }>('/internal/auth/login', credentials, { withCredentials: true });

    const setCookies = this.extractSetCookies(res);

    if (this.client instanceof ScopedAPIClient) {
      this.client.updateCookies(setCookies);
    }

    return { ...res.data, setCookies };
  }

  async refresh(): Promise<{
    access_token: string;
    refresh_token: string;
    setCookies: string[];
  }> {
    const res = await this.client.post<{
      access_token: string;
      refresh_token: string;
    }>('/internal/auth/refresh', undefined, { withCredentials: true });

    const setCookies = this.extractSetCookies(res);

    if (this.client instanceof ScopedAPIClient) {
      this.client.updateCookies(setCookies);
    }

    return { ...res.data, setCookies };
  }

  async logout(): Promise<{ message: string; setCookies: string[] }> {
    const res = await this.client.post<{ message: string }>('/internal/auth/logout', undefined, {
      withCredentials: true,
    });

    const setCookies = this.extractSetCookies(res);

    if (this.client instanceof ScopedAPIClient) {
      this.client.clearCookies();
    }

    return { ...res.data, setCookies };
  }
}
