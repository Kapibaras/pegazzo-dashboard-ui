'use server';

import { revalidatePath } from 'next/cache';
import ScopedAPIClient from '@/api/clients/scoped';
import { serverAction } from '@/helpers/serverAction';
import { toActionError } from '@/helpers/actionError';
import VehicleService from '@/services/vehicle';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function unarchiveVehicle(id: string) {
  return serverAction(async () => {
    const cookies = await getCookiesServer();
    const service = new VehicleService(new ScopedAPIClient(cookies));
    const result = await service.unarchiveVehicle(id);
    revalidatePath('/coches');
    revalidatePath(`/coches/${id}`);
    return { success: true as const, data: result };
  }, toActionError);
}
