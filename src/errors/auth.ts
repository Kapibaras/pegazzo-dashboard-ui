export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    status: 401,
    title: 'Credenciales inválidas',
    backendDetail: 'Invalid credentials',
    message: 'El usuario o la contraseña son incorrectos.',
  },
  INVALID_REFRESH_TOKEN: {
    status: 401,
    title: 'Token de actualización inválido',
    backendDetail: 'Invalid refresh token',
    message: 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.',
  },
  INVALID_OR_MISSING_TOKEN: {
    status: 401,
    title: 'Autenticación requerida',
    backendDetail: 'Invalid token or missing authentication',
    message: 'No se encontró un token válido o faltan credenciales de autenticación.',
  },
  INVALID_TOKEN: {
    status: 401,
    title: 'Token inválido',
    backendDetail: 'Invalid token provided',
    message: 'El token proporcionado no es válido o ha caducado.',
  },
  FORBIDDEN_ROLE: {
    status: 403,
    title: 'Acceso denegado',
    backendDetailStartsWith: 'Forbidden role provided.',
    message: 'No tienes permisos suficientes para acceder a este recurso.',
  },
  ALREADY_LOGGED_OUT: {
    status: 400,
    title: 'Sesión no activa',
    backendDetail: 'No active session found to log out',
    message: 'No se encontró una sesión activa para cerrar.',
  },
};
