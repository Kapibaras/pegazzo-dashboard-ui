import { notFound, redirect } from 'next/navigation';
import isAPIErrorType from '@/api/errors';
import ScopedAPIClient from '@/api/clients/scoped';
import { VehicleWizard } from '@/components/vehicles';
import VehicleService from '@/services/vehicle';
import { getCookiesServer } from '@/utils/cookies/server';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paso?: string }>;
};

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/** SSR loads the car so the form opens preloaded (no spinner); the form itself is a client component. */
const EditVehiclePage = async ({ params, searchParams }: Props) => {
  const { id } = await params;
  const { paso } = await searchParams;
  const cookies = await getCookiesServer();

  try {
    const vehicle = await new VehicleService(new ScopedAPIClient(cookies)).getVehicle(safeDecode(id));
    return (
      <VehicleWizard mode="edit" vehicle={vehicle} initialStep={paso === 'documentos' ? 'documents' : undefined} />
    );
  } catch (error) {
    if (isAPIErrorType(error)) {
      if (error.status_code === 401 && error.detail === 'SESSION_EXPIRED') redirect('/api/auth/signout');
      if (error.status_code === 404) notFound();
    }
    throw error;
  }
};

export default EditVehiclePage;
