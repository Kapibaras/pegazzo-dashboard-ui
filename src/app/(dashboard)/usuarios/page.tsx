import { ScopedAPIClient } from '@/api';
import { Container } from '@/components/common';
import { UsersTableView } from '@/components/users';

import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function UsersPage() {
  const cookies = await getCookiesServer();
  const service = new UserService(new ScopedAPIClient(cookies));

  const users = await service.getAllUsers();

  return (
    <Container>
      <UsersTableView users={users} />
    </Container>
  );
}
