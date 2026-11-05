import { notFound, redirect } from 'next/navigation';
import isAPIErrorType from '@/api/errors';
import ScopedAPIClient from '@/api/clients/scoped';
import { DriverWizard } from '@/components/drivers';
import DriverService from '@/services/driver';
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

/** SSR loads the driver so the form opens preloaded (no spinner); the form itself is a client component. */
const EditDriverPage = async ({ params, searchParams }: Props) => {
  const { id } = await params;
  const { paso } = await searchParams;
  const cookies = await getCookiesServer();

  try {
    const driver = await new DriverService(new ScopedAPIClient(cookies)).getDriver(safeDecode(id));
    return <DriverWizard mode="edit" driver={driver} initialStep={paso === 'documentos' ? 'documents' : undefined} />;
  } catch (error) {
    if (isAPIErrorType(error)) {
      if (error.status_code === 401 && error.detail === 'SESSION_EXPIRED') redirect('/api/auth/signout');
      if (error.status_code === 404) notFound();
    }
    throw error;
  }
};

export default EditDriverPage;
