import ScopedAPIClient from '@/api/clients/scoped';
import { ModelCatalogView } from '@/components/catalog';
import { requireRole } from '@/helpers/requireRole';
import { Role } from '@/lib/schemas/userSchema';
import { VehicleService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

/** Brand/model catalog management. The backend only lets the owner create or delete entries. */
const CatalogoPage = async () => {
  await requireRole([Role.OWNER]);

  const cookies = await getCookiesServer();
  const groups = await new VehicleService(new ScopedAPIClient(cookies)).getModels();

  return <ModelCatalogView groups={groups} />;
};

export default CatalogoPage;
