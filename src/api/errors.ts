export class APIError extends Error {
    status_code: number;
  
    constructor(message: string, status_code: number) {
      super(message);
      this.name = "APIError";
      this.status_code = status_code;
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
  
  export class APIRequestFailed extends Error {
    status_code: number;
  
    constructor(message: string, status_code: number) {
      super(message);
      this.name = "APIRequestFailed";
      this.status_code = status_code;
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
  