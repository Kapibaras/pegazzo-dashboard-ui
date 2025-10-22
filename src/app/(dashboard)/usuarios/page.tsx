import { Container } from '@/components/common';
import { Input } from '@/components/ui/input';
import { CreateUserSheet } from '@/components/users/CreateUserSheet';

export default async function UsersPage() {
  return (
    <Container>
      <div className="flex items-center gap-3">
        <Input
          id="Buscar usuario..."
          name="Buscar usuario..."
          placeholder="Buscar usuario..."
          className="typo-text border-surface-700 bg-surface-400 flex max-w-md items-center self-stretch rounded-md border px-2.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
        />
        <CreateUserSheet />
      </div>
    </Container>
  );
}
