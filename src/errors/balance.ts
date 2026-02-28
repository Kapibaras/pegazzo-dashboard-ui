export const BALANCE_ERRORS = {
  TRANSACTION_NOT_FOUND: {
    status: 404,
    backendDetail: 'Transaction not found',
    title: 'Transacción no encontrada',
    message: 'No se encontró la transacción especificada.',
  },
  UNAUTHORIZED: {
    status: 403,
    backendDetail: 'Forbidden',
    title: 'Sin permiso',
    message: 'No tienes permiso para realizar esta acción.',
  },
};
