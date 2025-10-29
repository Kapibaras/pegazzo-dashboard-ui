'use server';
import handleUserAction from '@/helpers/handleUserAction';

export default async function updateUserNamesAction(formData: FormData) {
  return handleUserAction({
    formData,
    actionType: 'updateNames',
    action: async (userService, username, data) =>
      userService.updateUserName(username, {
        name: data.name,
        surnames: data.surnames,
      }),
    successMessage: '¡Usuario actualizado exitosamente!',
    errorMessage: 'Error al actualizar el usuario. Inténtalo de nuevo.',
  });
}
