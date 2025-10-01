import AbstractUnauthedAPIService from "./base/AbstractUnauthedAPIService";
import { AxiosResponse } from "axios";

export default class AuthService extends AbstractUnauthedAPIService {

  private _handleSSRContextCookies(res: AxiosResponse<any>, ssrContext?: { setCookie?: (cookie: string) => void }): void {
    const setCookieHeader = res.headers["set-cookie"];
    
    if (setCookieHeader && ssrContext?.setCookie) {
      const cookiesArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      cookiesArray.forEach(c => ssrContext.setCookie!(c)); 
    }
  }

  async login(
    credentials: { username: string; password: string },
    ssrContext?: { setCookie?: (cookie: string) => void }
  ): Promise<{ access_token: string; refresh_token: string }> {
    const res = await this.client.post<{ access_token: string; refresh_token: string }>( 
      "/auth/login",
      credentials,
      { withCredentials: true }
    );

    this._handleSSRContextCookies(res, ssrContext); 

    return res.data;
  }
  
  async refresh(ssrContext?: { setCookie?: (cookie: string) => void }): Promise<{ access_token: string; refresh_token: string }> {
    const res = await this.client.post<{ access_token: string; refresh_token: string }>(
      "/auth/refresh",
      undefined,
      { withCredentials: true }
    );
    
    this._handleSSRContextCookies(res, ssrContext); 

    return res.data;
  }

  async logout(ssrContext?: { setCookie?: (cookie: string) => void }): Promise<{ message: string }> {
    const res = await this.client.post<{ message: string }>(
      "/auth/logout",
      undefined,
      { withCredentials: true }
    );
    
    this._handleSSRContextCookies(res, ssrContext); 

    return res.data;
  }
}