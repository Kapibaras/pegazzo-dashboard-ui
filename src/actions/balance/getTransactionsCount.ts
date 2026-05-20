'use server';

import { ScopedAPIClient } from '@/api';
import isAPIErrorType from '@/api/errors';
import { serverAction } from '@/helpers/serverAction';
import { BalanceService } from '@/services';
import { TransactionCount, TransactionsCountParams } from '@/types/transaction';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function getTransactionsCountAction(
  params?: TransactionsCountParams,
): Promise<{ success: true; data: TransactionCount } | { success: false; message: string; status?: number }> {
  return serverAction(
    async () => {
      const cookies = await getCookiesServer();
      const data = await new BalanceService(new ScopedAPIClient(cookies)).getTransactionsCount(params);
      return { success: true as const, data };
    },
    (error) => {
      console.error('Error fetching transactions count:', error);
      return {
        success: false as const,
        status: isAPIErrorType(error) ? error.status_code : 500,
        message: 'Error al obtener el conteo de transacciones, intente más tarde.',
      };
    },
  );
}
