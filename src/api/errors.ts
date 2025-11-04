export class APIError extends Error {
  status_code: number;
  detail: string;

  constructor(message: string, status_code: number, detail?: string) {
    super(`[APIError] ${message}`);
    this.name = 'APIError';
    this.status_code = status_code;
    this.detail = detail || message;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class APIRequestFailed extends Error {
  status_code: number;
  detail: string;

  constructor(message: string, status_code: number, detail?: string) {
    super(`[APIRequestFailed] ${message}`);
    this.name = 'APIRequestFailed';
    this.status_code = status_code;
    this.detail = detail || message;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default function isAPIErrorType(error: unknown): error is APIError | APIRequestFailed {
  return error instanceof APIError || error instanceof APIRequestFailed;
}
