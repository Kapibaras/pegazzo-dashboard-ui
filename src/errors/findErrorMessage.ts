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

export default findErrorMessage;
