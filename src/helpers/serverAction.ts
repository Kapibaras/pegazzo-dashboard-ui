import { redirect } from 'next/navigation';

const isSessionExpired = (error: unknown): boolean =>
  error !== null &&
  typeof error === 'object' &&
  'status_code' in error &&
  'detail' in error &&
  (error as { status_code: number; detail: string }).status_code === 401 &&
  (error as { status_code: number; detail: string }).detail === 'SESSION_EXPIRED';

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
