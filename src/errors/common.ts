export const COMMON_ERRORS = {
  NETWORK_ERROR: {
    status: 0,
    title: 'Error de conexión',
    message: 'No se pudo establecer comunicación con el servidor. Verifica tu conexión.',
  },
  UNKNOWN: {
    status: 500,
    title: 'Error desconocido',
    message: 'Ha ocurrido un error inesperado. Intenta de nuevo más tarde.',
  },
  UNEXPECTED: {
    status: 500,
    title: 'Error inesperado',
    message: 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.',
  },
};
