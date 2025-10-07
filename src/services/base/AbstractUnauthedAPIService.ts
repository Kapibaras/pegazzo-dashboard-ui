import APIClientBase from "@/api/clients/base";

export default abstract class AbstractUnauthedAPIService {
    protected readonly client: APIClientBase;
  
    constructor(client: APIClientBase) {
      this.client = client;
    }
  }
  

