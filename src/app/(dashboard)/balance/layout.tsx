import { Container } from '@/components/common';
import { BalanceFilters } from '@/components/balance';

export default function BalanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="typo-title">Balance</h1>
          <BalanceFilters />
        </div>
        {children}
      </div>
    </Container>
  );
}
