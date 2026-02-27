import { Container } from '@/components/common';

export default function BalanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Container>
      <div className="min-w-0 space-y-3">{children}</div>
    </Container>
  );
}
