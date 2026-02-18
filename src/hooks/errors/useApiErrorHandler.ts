import { useRouter } from 'next/navigation';
import { logout } from '@/actions/auth';
import { ToastService } from '@/services/toast';
import { ERROR_MESSAGES } from '@/errors';

export type ErrorModules = keyof typeof ERROR_MESSAGES;

interface ErrorDefinition {
  status: number;
  title: string;
  message: string;
  backendDetail?: string;
  backendDetailStartsWith?: string;
}

interface ApiError {
  status: number;
  detail: string;
}

export const useApiErrorHandler = () => {
  const router = useRouter();

  const findErrorMessage = (error: ApiError, modules: ErrorModules[]) => {
    for (const errorModule of modules) {
      const moduleErrors = ERROR_MESSAGES[errorModule];

      for (const err of Object.values(moduleErrors) as ErrorDefinition[]) {
        if (
          err.status === error.status &&
          (err.backendDetail === error.detail ||
            (err.backendDetailStartsWith && error.detail.startsWith(err.backendDetailStartsWith)))
        ) {
          return { title: err.title, message: err.message };
        }
      }
    }

    return {
      title: 'Error inesperado',
      message: 'Ocurrió un error desconocido. Inténtalo de nuevo más tarde.',
    };
  };

  const handleApiError = async (error: ApiError, modules: ErrorModules[] = ['common']) => {
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
