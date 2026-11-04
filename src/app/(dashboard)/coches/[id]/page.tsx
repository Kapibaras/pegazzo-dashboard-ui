import { notFound, redirect } from 'next/navigation';
import isAPIErrorType from '@/api/errors';
import ScopedAPIClient from '@/api/clients/scoped';
import { VehicleDetail } from '@/components/vehicles';
import VehicleService from '@/services/vehicle';
import { getCookiesServer } from '@/utils/cookies/server';

type Props = {
  params: Promise<{ id: string }>;
};

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/** SSR: the detail is read-only data tied to the session, and presigned document URLs must be fresh on each render. */
const VehicleDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const cookies = await getCookiesServer();

  try {
    const vehicle = await new VehicleService(new ScopedAPIClient(cookies)).getVehicle(safeDecode(id));
    return <VehicleDetail vehicle={vehicle} />;
  } catch (error) {
    if (isAPIErrorType(error)) {
      if (error.status_code === 401 && error.detail === 'SESSION_EXPIRED') redirect('/api/auth/signout');
      if (error.status_code === 404) notFound();
    }
    throw error;
  }
};

export default VehicleDetailPage;
