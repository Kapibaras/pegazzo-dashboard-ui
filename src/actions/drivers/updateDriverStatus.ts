'use server';

import { revalidatePath } from 'next/cache';
import ScopedAPIClient from '@/api/clients/scoped';
import { serverAction } from '@/helpers/serverAction';
import { toActionError } from '@/helpers/actionError';
import DriverService from '@/services/driver';
import { getCookiesServer } from '@/utils/cookies/server';
import { DriverStatus } from '@/types/driver';

export default async function updateDriverStatusAction(id: string, status: DriverStatus) {
  return serverAction(async () => {
    const cookies = await getCookiesServer();
    const result = await new DriverService(new ScopedAPIClient(cookies)).updateStatus(id, status);
    revalidatePath('/conductores');
    revalidatePath(`/conductores/${id}`);
    return { success: true as const, data: result };
  }, toActionError);
}
