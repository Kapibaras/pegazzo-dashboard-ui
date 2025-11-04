export const USER_ERRORS = {
  USERNAME_ALREADY_EXISTS: {
    status: 400,
    backendDetail: 'Username already exists',
    title: 'Usuario ya existente',
    message: 'El nombre de usuario ya está registrado. Por favor, elige otro.',
  },
  INVALID_ROLE: {
    status: 400,
    backendDetail: 'Invalid role provided',
    title: 'Rol no válido',
    message: 'El rol proporcionado no es válido.',
  },
  INVALID_PASSWORD: {
    status: 401,
    backendDetail: 'Invalid credentials',
    title: 'Contraseña inválida',
    message: 'La contraseña proporcionada no cumple con los requisitos o es incorrecta.',
  },
  USER_NOT_FOUND: {
    status: 404,
    backendDetail: 'User not found',
    title: 'Usuario no encontrado',
    message: 'No se encontró un usuario con el nombre proporcionado.',
  },
  ROLE_NOT_FOUND: {
    status: 404,
    backendDetail: 'Role not found',
    title: 'Rol no encontrado',
    message: 'El rol especificado no existe en el sistema.',
  },
  FORBIDDEN_ROLE: {
    status: 403,
    backendDetail: 'Forbidden role provided',
    title: 'Rol no permitido',
    message: 'No tienes permisos para asignar o utilizar este rol.',
  },
};
