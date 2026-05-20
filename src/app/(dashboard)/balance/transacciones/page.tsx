import { TransactionTableView } from '@/components/balance/transactions';

import { TransactionStatus } from '@/types/transaction';

const VALID_STATUSES: TransactionStatus[] = ['PENDING', 'CONFIRMED', 'REJECTED'];

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const TransaccionesPage = async ({ searchParams }: Props) => {
  const { status } = await searchParams;
  const initialStatus = VALID_STATUSES.includes(status as TransactionStatus)
    ? (status as TransactionStatus)
    : undefined;

  return <TransactionTableView initialStatus={initialStatus} />;
};

export default TransaccionesPage;
