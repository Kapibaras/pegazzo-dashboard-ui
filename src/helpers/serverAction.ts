import { redirect } from 'next/navigation';
import { APIRequestFailed } from '@/api/errors';

const isSessionExpired = (error: unknown): boolean =>
  error instanceof APIRequestFailed && error.status_code === 401 && error.detail === 'SESSION_EXPIRED';

export async function serverAction<TSuccess, TError>(
  fn: () => Promise<TSuccess>,
  onError: (error: unknown) => TError,
): Promise<TSuccess | TError> {
  try {
    return await fn();
  } catch (error) {
    if (isSessionExpired(error)) {
      redirect('/api/auth/signout');
    }
    return onError(error);
  }
}
