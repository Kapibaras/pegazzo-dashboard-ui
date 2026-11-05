'use server';

import { revalidatePath } from 'next/cache';
import ScopedAPIClient from '@/api/clients/scoped';
import { serverAction } from '@/helpers/serverAction';
import { toActionError } from '@/helpers/actionError';
import VehicleService from '@/services/vehicle';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function deleteAssociate(id: number) {
  return serverAction(async () => {
    const cookies = await getCookiesServer();
    await new VehicleService(new ScopedAPIClient(cookies)).deleteAssociate(id);
    revalidatePath('/socios');
    return { success: true as const };
  }, toActionError);
}
