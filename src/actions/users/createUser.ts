'use server';
import handleUserAction from '@/helpers/handleUserAction';

export default async function createUserAction(formData: FormData) {
  return handleUserAction({
    formData,
    actionType: 'create',
    action: async (userService, data) => userService.createUser(data),
    successMessage: '¡Usuario creado exitosamente!',
    errorMessage: 'Error al crear el usuario. Inténtalo de nuevo.',
  });
}
