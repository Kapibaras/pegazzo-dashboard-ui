'use server';

import { revalidatePath } from 'next/cache';
import ScopedAPIClient from '@/api/clients/scoped';
import { serverAction } from '@/helpers/serverAction';
import { toActionError } from '@/helpers/actionError';
import DriverService from '@/services/driver';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function archiveDriver(id: string) {
  return serverAction(async () => {
    const cookies = await getCookiesServer();
    const result = await new DriverService(new ScopedAPIClient(cookies)).archiveDriver(id);
    revalidatePath('/conductores');
    revalidatePath(`/conductores/${id}`);
    return { success: true as const, data: result };
  }, toActionError);
}
