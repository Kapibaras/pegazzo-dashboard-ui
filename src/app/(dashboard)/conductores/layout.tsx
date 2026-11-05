import { Container } from '@/components/common';

export default function ConductoresLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Container>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
