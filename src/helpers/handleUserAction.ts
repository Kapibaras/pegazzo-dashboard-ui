'use server';

import { revalidatePath } from 'next/cache';
import { userSchema, updateNamesSchema, updatePasswordSchema } from '@/lib/schemas/userSchema';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

type ActionType = 'create' | 'updateNames' | 'updatePassword';

interface HandleUserActionProps {
  formData: FormData;
  actionType: ActionType;
  action: (...args: any[]) => Promise<any>;
  successMessage: string;
  errorMessage: string;
}

const schemaMap = {
  create: userSchema,
  updateNames: updateNamesSchema,
  updatePassword: updatePasswordSchema,
} as const;

export default async function handleUserAction({
  formData,
  actionType,
  action,
  successMessage,
  errorMessage,
}: HandleUserActionProps) {
  const data = Object.fromEntries(formData) as Record<string, string>;
  const schema = schemaMap[actionType];
  const validated = schema.safeParse(data);

  if (!validated.success) {
    const fieldErrors = validated.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const path = issue.path[0] as string;
      acc[path] = [...(acc[path] || []), issue.message];
      return acc;
    }, {});
    return { success: false, errors: fieldErrors };
  }

  try {
    const cookies = await getCookiesServer();
    const userService = new UserService(new ScopedAPIClient(cookies));
    const username = actionType === 'create' ? undefined : (data.userId ?? data.username);
    const args = username !== undefined ? [userService, username, validated.data] : [userService, validated.data];
    const result = await action(...args);

    revalidatePath('/users');

    return {
      success: true,
      message: successMessage,
      data: result,
    };
  } catch (error: any) {
    console.error('Error en acción de usuario:', error?.response?.data || error.message);
    return {
      success: false,
      message: errorMessage,
    };
  }
}
