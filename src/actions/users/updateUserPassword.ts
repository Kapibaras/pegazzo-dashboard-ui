'use server';
import handleUserAction from '@/helpers/handleUserAction';

export default async function updateUserPasswordAction(formData: FormData) {
  return handleUserAction({
    formData,
    actionType: 'updatePassword',
    action: async (userService, username, data) =>
      userService.updateUserPassword(username, {
        password: data.password,
      }),
    successMessage: '¡Contraseña actualizada exitosamente!',
    errorMessage: 'Error al actualizar la contraseña. Inténtalo de nuevo.',
  });
}
