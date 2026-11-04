export type NormalizedApiError = { status: number; detail: string };

/**
 * Normalizes the different error shapes the client can throw into `{ status, detail }`:
 * - `APIError` / `APIRequestFailed` (`status_code` + `detail`) from the singleton client interceptor
 * - raw `AxiosError` (401s are passed through untouched by the interceptor)
 * - anything else (network failures, aborted requests, ...)
 */
export const normalizeApiError = (error: unknown, fallback = 'Error inesperado.'): NormalizedApiError => {
  if (error && typeof error === 'object') {
    const err = error as {
      status_code?: number;
      status?: number;
      detail?: unknown;
      message?: string;
      response?: { status?: number; data?: { detail?: unknown } };
    };

    const status = err.status_code ?? err.response?.status ?? err.status ?? 500;
    const rawDetail = err.detail ?? err.response?.data?.detail ?? err.message;
    const detail = typeof rawDetail === 'string' ? rawDetail : fallback;

    return { status, detail };
  }

  return { status: 500, detail: fallback };
};

export const isAbortError = (error: unknown): boolean =>
  !!error &&
  typeof error === 'object' &&
  ((error as { code?: string }).code === 'ERR_CANCELED' || (error as { name?: string }).name === 'CanceledError');
