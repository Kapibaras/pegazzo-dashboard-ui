export class APIError extends Error {
  status_code: number;

  constructor(message: string, status_code: number) {
    super(`[APIError] ${message}`);
    this.name = 'APIError';
    this.status_code = status_code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class APIRequestFailed extends Error {
  status_code: number;

  constructor(message: string, status_code: number) {
    super(`[APIRequestFailed] ${message}`);
    this.name = 'APIRequestFailed';
    this.status_code = status_code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default function isAPIErrorType(error: unknown): error is APIError | APIRequestFailed {
  return error instanceof APIError || error instanceof APIRequestFailed;
}
