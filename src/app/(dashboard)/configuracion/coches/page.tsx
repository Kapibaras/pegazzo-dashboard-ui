import ScopedAPIClient from '@/api/clients/scoped';
import { VehicleSettingsTab, VehicleSettingsView } from '@/components/settings';
import { requireRole } from '@/helpers/requireRole';
import { Role } from '@/lib/schemas/userSchema';
import { VehicleService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

/**
 * Vehicle settings: brand/model catalog and insurers. The backend only lets the owner manage the catalog, and the
 * navigation entry is owner-only too.
 */
const ConfiguracionCochesPage = async ({ searchParams }: { searchParams: Promise<{ tab?: string }> }) => {
  await requireRole([Role.OWNER]);

  const { tab } = await searchParams;
  const initialTab: VehicleSettingsTab = tab === 'aseguradoras' ? 'aseguradoras' : 'modelos';

  const service = new VehicleService(new ScopedAPIClient(await getCookiesServer()));
  const [groups, insurances] = await Promise.all([service.getModels(), service.getInsurances()]);

  return <VehicleSettingsView groups={groups} insurances={insurances} initialTab={initialTab} />;
};

export default ConfiguracionCochesPage;
