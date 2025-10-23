import AbstractAPIService from './base/AbstractAPIService';
import APIClientBase from '@/api/clients/base';
import { User } from '@/types/user';

export default class UserService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async getAllUsers(role?: string): Promise<User[]> {
    return (await this.client.get('/internal/user', { params: role ? { role } : {} })).data;
  }

  async getUserByUsername(username: string): Promise<User> {
    return (await this.client.get(`/internal/user/${username}`)).data;
  }

  async createUser(data: {
    username: string;
    name: string;
    surnames: string;
    password: string;
    role: string;
  }): Promise<User> {
    const response = await this.client.post('/internal/user', data);
    return response.data;
  }
}
