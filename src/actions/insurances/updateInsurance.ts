'use server';

import { revalidatePath } from 'next/cache';
import ScopedAPIClient from '@/api/clients/scoped';
import { serverAction } from '@/helpers/serverAction';
import { toActionError } from '@/helpers/actionError';
import VehicleService from '@/services/vehicle';
import { InsuranceUpdate } from '@/types/vehicle';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function updateInsurance(id: number, data: InsuranceUpdate) {
  return serverAction(async () => {
    const cookies = await getCookiesServer();
    const result = await new VehicleService(new ScopedAPIClient(cookies)).updateInsurance(id, data);
    revalidatePath('/configuracion/coches');
    return { success: true as const, data: result };
  }, toActionError);
}
