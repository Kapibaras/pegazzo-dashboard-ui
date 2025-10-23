'use server';

import handleUserAction from '@/helpers/handleUserAction';

export async function updateUserNamesAction(formData: FormData) {
  return handleUserAction({
    formData,
    action: async (userService, data) =>
      userService.updateUserName(data.username, {
        name: data.name,
        surnames: data.surnames,
      }),
    successMessage: '¡Usuario actualizado exitosamente!',
    errorMessage: 'Error al actualizar el usuario. Inténtalo de nuevo.',
  });
}
