'use server';

import { serverAction } from '@/helpers/serverAction';
import { getCookiesServer } from '@/utils/cookies/server';
import ScopedAPIClient from '@/api/clients/scoped';
import BalanceService from '@/services/balance';
import isAPIErrorType from '@/api/errors';
import { TransactionCreate } from '@/types/transaction';

export default async function createTransactionAction(data: TransactionCreate) {
  return serverAction(
    async () => {
      const cookies = await getCookiesServer();
      const result = await new BalanceService(new ScopedAPIClient(cookies)).createTransaction(data);
      return { success: true as const, data: result };
    },
    (error) => ({
      success: false as const,
      status: isAPIErrorType(error) ? error.status_code : 500,
      message: isAPIErrorType(error) ? error.detail : 'Error al crear la transacción.',
    }),
  );
}
