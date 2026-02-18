'use server';

import { ScopedAPIClient } from '@/api';
import isAPIErrorType from '@/api/errors';
import { BalanceService } from '@/services';
import { BalanceMetricsSimple } from '@/types/balance';
import { getCookiesServer } from '@/utils/cookies/server';
import { serverAction } from '@/helpers/serverAction';

export default async function getBalanceMetrics(params?: {
  month?: number;
  year?: number;
}): Promise<{ success: true; data: BalanceMetricsSimple } | { success: false; message: string; status?: number }> {
  return serverAction(
    async () => {
      const cookies = await getCookiesServer();
      const data = await new BalanceService(new ScopedAPIClient(cookies)).getSimpleMetrics(params);
      return { success: true as const, data };
    },
    (error) => {
      console.error('Error fetching balance metrics:', error);
      return {
        success: false as const,
        status: isAPIErrorType(error) ? error.status_code : 500,
        message: 'Error al obtener las métricas del balance, intente más tarde.',
      };
    },
  );
}
