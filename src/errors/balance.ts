export const BALANCE_ERRORS = {
  TRANSACTION_NOT_FOUND: {
    status: 404,
    backendDetailStartsWith: 'Transaction with reference',
    title: 'Transacción no encontrada',
    message: 'No se encontró la transacción especificada.',
  },
  UNAUTHORIZED: {
    status: 403,
    backendDetail: 'Forbidden',
    title: 'Sin permiso',
    message: 'No tienes permiso para realizar esta acción.',
  },
  INVALID_TRANSACTION_TYPE: {
    status: 400,
    backendDetail: 'Invalid transaction type',
    title: 'Tipo de transacción inválido',
    message: 'El tipo de transacción proporcionado no es válido.',
  },
  INVALID_PAYMENT_METHOD: {
    status: 400,
    backendDetail: 'Invalid payment method',
    title: 'Método de pago inválido',
    message: 'El método de pago proporcionado no es válido.',
  },
  DESCRIPTION_TOO_LONG: {
    status: 400,
    backendDetail: 'Description must be 255 characters or fewer',
    title: 'Descripción muy larga',
    message: 'La descripción no puede superar los 255 caracteres.',
  },
  DELETE_NOT_REJECTED: {
    status: 403,
    backendDetail: 'Admins can only delete REJECTED transactions',
    title: 'Acción no permitida',
    message: 'Solo se pueden eliminar transacciones rechazadas.',
  },
  EDIT_NOT_REJECTED: {
    status: 403,
    backendDetail: 'Admins can only edit REJECTED transactions',
    title: 'Acción no permitida',
    message: 'Solo se pueden editar transacciones rechazadas.',
  },
  AUTHORIZE_STATUS_FORBIDDEN: {
    status: 403,
    backendDetail: 'Admins can only set transaction status to PENDING',
    title: 'Acción no permitida',
    message: 'Solo puedes cambiar el estado de la transacción a pendiente.',
  },
  RESUBMIT_NOT_REJECTED: {
    status: 422,
    backendDetail: 'Admins can only re-submit REJECTED transactions to PENDING',
    title: 'Acción no permitida',
    message: 'Solo se pueden reenviar transacciones rechazadas a estado pendiente.',
  },
};
