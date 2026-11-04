import ScopedAPIClient from '@/api/clients/scoped';
import { AssociatesView } from '@/components/associates';
import { Container } from '@/components/common';
import { requireRole } from '@/helpers/requireRole';
import { Role } from '@/lib/schemas/userSchema';
import { VehicleService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

/**
 * Server Component: guards the route by role and fetches the (small, unpaginated) associates list so the first paint
 * already has data. Search and the detail sheet live in the client view.
 */
const SociosPage = async () => {
  await requireRole([Role.OWNER, Role.ADMIN]);

  const cookies = await getCookiesServer();
  const associates = await new VehicleService(new ScopedAPIClient(cookies)).getAssociates();

  return (
    <Container>
      <div className="min-w-0">
        <AssociatesView associates={associates} />
      </div>
    </Container>
  );
};

export default SociosPage;
