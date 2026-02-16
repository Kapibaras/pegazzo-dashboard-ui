'use server';

import { ScopedAPIClient } from '@/api';
import { APIError, APIRequestFailed } from '@/api/errors';
import { BalanceService } from '@/services';
import { BalanceMetricsSimple } from '@/types/balance';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function getBalanceMetrics(params?: { month?: number; year?: number }): Promise<
  | { success: true; data: BalanceMetricsSimple }
  | { success: false; message: string; status?: number }
> {
  try {
    const cookies = await getCookiesServer();
    const client = new ScopedAPIClient(cookies);
    const balanceService = new BalanceService(client);

    const data = await balanceService.getSimpleMetrics(params);

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Error fetching balance metrics:', error);

    if (error instanceof APIError || error instanceof APIRequestFailed) {
      return {
        success: false,
        status: error.status_code,
        message: error.detail || 'Error al obtener las métricas de balance.',
      };
    }

    const message = error instanceof Error ? error.message : 'Error al obtener las métricas de balance.';
    return { success: false, status: 500, message };
  }
}
