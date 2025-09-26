import AbstractAPIService from "./base/AbstractAPIService";
import { AxiosResponse } from "axios";
import APIClientBase from "@/api/clients/base";

export default class UserService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async getAllUsers(role?: string): Promise<AxiosResponse<any>> {
    return this.client.get("/user", {
      params: role ? { role } : {},
    });
  }
}
