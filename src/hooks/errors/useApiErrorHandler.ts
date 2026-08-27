import { useRouter } from 'next/navigation';
import { logout } from '@/actions/auth';
import { ToastService } from '@/services/toast';
import findErrorMessage, { type ErrorModules } from '@/errors/findErrorMessage';

export type { ErrorModules };

export const useApiErrorHandler = () => {
  const router = useRouter();

  const handleApiError = async (error: { status: number; detail: string }, modules: ErrorModules[] = ['common']) => {
    if (error.status === 401) {
      await logout();
      router.push('/login');
      return;
    }

    const { title, message } = findErrorMessage(error, modules);
    ToastService.error(title, message);
  };

  return { handleApiError };
};
