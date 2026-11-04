import isAPIErrorType from '@/api/errors';

/** Shared `onError` mapper for server actions (see the `serverAction` wrapper in CLAUDE.md). */
export const toActionError = (error: unknown) => ({
  success: false as const,
  status: isAPIErrorType(error) ? error.status_code : 500,
  detail: isAPIErrorType(error) ? error.detail : 'Error inesperado.',
});
