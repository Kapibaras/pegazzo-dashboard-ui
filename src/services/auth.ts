import AbstractUnauthedAPIService from "./base/AbstractUnauthedAPIService";

export default class AuthService extends AbstractUnauthedAPIService {

  async login(credentials: { username: string; password: string }) {
    return this.client.post("/auth/login", credentials, { withCredentials: true });
  }

  async refresh() {
    return this.client.post("/auth/refresh", undefined, { withCredentials: true });
  }

  async logout() {
    return this.client.post("/auth/logout", undefined, { withCredentials: true });
  }
}
