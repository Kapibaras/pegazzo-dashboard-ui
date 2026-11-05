import { DriverListView } from '@/components/drivers';
import { DriverListState } from '@/hooks/drivers';
import { DRIVER_LIMIT_OPTIONS, isDriverSortBy, isDriverStatus } from '@/lib/driver';

type SearchParams = {
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  archived?: string;
  page?: string;
  limit?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

const toPositiveInt = (value: string | undefined): number | undefined => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

/**
 * Server Component: reads the URL query (shareable state) and hands a sanitized initial state to the client view,
 * which then fetches and keeps the URL in sync (same approach as `coches`).
 */
const ConductoresPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const initialState: Partial<DriverListState> = {};

  if (isDriverStatus(params.status)) initialState.status = params.status;
  if (params.search?.trim()) initialState.search = params.search.trim().slice(0, 100);
  if (isDriverSortBy(params.sort_by)) initialState.sortBy = params.sort_by;
  if (params.sort_order === 'asc' || params.sort_order === 'desc') initialState.sortOrder = params.sort_order;
  if (params.archived === 'true') initialState.archived = true;

  const page = toPositiveInt(params.page);
  if (page) initialState.page = page;

  const limit = toPositiveInt(params.limit);
  if (limit && (DRIVER_LIMIT_OPTIONS as readonly number[]).includes(limit)) initialState.limit = limit;

  return <DriverListView initialState={initialState} />;
};

export default ConductoresPage;
