import { VehicleListView } from '@/components/vehicles';
import { VehicleListState } from '@/hooks/vehicles';
import { isVehicleSortBy, isVehicleStatus, VEHICLE_LIMIT_OPTIONS } from '@/lib/vehicle';

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
 * which then fetches and keeps the URL in sync (same approach as `balance/transacciones`).
 */
const CochesPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const initialState: Partial<VehicleListState> = {};

  if (isVehicleStatus(params.status)) initialState.status = params.status;
  if (params.search?.trim()) initialState.search = params.search.trim().slice(0, 100);
  if (isVehicleSortBy(params.sort_by)) initialState.sortBy = params.sort_by;
  if (params.sort_order === 'asc' || params.sort_order === 'desc') initialState.sortOrder = params.sort_order;
  if (params.archived === 'true') initialState.archived = true;

  const page = toPositiveInt(params.page);
  if (page) initialState.page = page;

  const limit = toPositiveInt(params.limit);
  if (limit && (VEHICLE_LIMIT_OPTIONS as readonly number[]).includes(limit)) initialState.limit = limit;

  return <VehicleListView initialState={initialState} />;
};

export default CochesPage;
