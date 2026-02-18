'use server';

import { revalidatePath } from 'next/cache';
import { userSchema, updateNamesSchema, updatePasswordSchema } from '@/lib/schemas/userSchema';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';
import isAPIErrorType from '@/api/errors';
import { serverAction } from '@/helpers/serverAction';

type ActionType = 'create' | 'updateNames' | 'updatePassword';

interface HandleUserActionProps {
  formData: FormData;
  actionType: ActionType;
  action: (...args: any[]) => Promise<any>;
  successMessage: string;
  errorMessage: string;
}

interface HandleUserActionResult {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string[]>;
  status?: number;
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
}: HandleUserActionProps): Promise<HandleUserActionResult> {
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

  return serverAction(
    async () => {
      const cookies = await getCookiesServer();
      const userService = new UserService(new ScopedAPIClient(cookies));

      const username = actionType === 'create' ? undefined : (data.userId ?? data.username);
      const args = username !== undefined ? [userService, username, validated.data] : [userService, validated.data];

      const result = await action(...args);

      revalidatePath('/dashboard/users');

      return { success: true, message: successMessage, data: result };
    },
    (error) => {
      console.error('Error en acción de usuario:', error);
      return {
        success: false,
        status: isAPIErrorType(error) ? error.status_code : 500,
        message: isAPIErrorType(error) ? error.detail || errorMessage : errorMessage,
      };
    },
  );
}
