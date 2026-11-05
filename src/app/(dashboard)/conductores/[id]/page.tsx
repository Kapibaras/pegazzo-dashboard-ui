import { notFound, redirect } from 'next/navigation';
import isAPIErrorType from '@/api/errors';
import ScopedAPIClient from '@/api/clients/scoped';
import { DriverDetail } from '@/components/drivers';
import DriverService from '@/services/driver';
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
const DriverDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const cookies = await getCookiesServer();

  try {
    const driver = await new DriverService(new ScopedAPIClient(cookies)).getDriver(safeDecode(id));
    return <DriverDetail driver={driver} />;
  } catch (error) {
    if (isAPIErrorType(error)) {
      if (error.status_code === 401 && error.detail === 'SESSION_EXPIRED') redirect('/api/auth/signout');
      if (error.status_code === 404) notFound();
    }
    throw error;
  }
};

export default DriverDetailPage;
