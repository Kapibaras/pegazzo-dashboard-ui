'use server';

import { revalidatePath } from 'next/cache';
import ScopedAPIClient from '@/api/clients/scoped';
import { serverAction } from '@/helpers/serverAction';
import { toActionError } from '@/helpers/actionError';
import VehicleService from '@/services/vehicle';
import { getCookiesServer } from '@/utils/cookies/server';
import { VehicleStatus } from '@/types/vehicle';

export default async function updateVehicleStatusAction(id: string, status: VehicleStatus) {
  return serverAction(async () => {
    const cookies = await getCookiesServer();
    const result = await new VehicleService(new ScopedAPIClient(cookies)).updateStatus(id, status);
    revalidatePath('/coches');
    revalidatePath(`/coches/${id}`);
    return { success: true as const, data: result };
  }, toActionError);
}
