import Link from 'next/link';
import { VehicleSummary } from '@/types/vehicle';
import { getColorSwatch, getVehicleTitle } from '@/lib/vehicle';
import { cn } from '@/lib/utils';
import VehicleActionsMenu from './VehicleActionsMenu';
import VehicleStatusBadge from './VehicleStatusBadge';

type VehicleCardProps = {
  vehicle: VehicleSummary;
  archived?: boolean;
  onChanged?: () => void;
};

export const VEHICLE_PLACEHOLDER_SRC = '/images/car-placeholder.svg';

const VehicleCard = ({ vehicle, archived = false, onChanged }: VehicleCardProps) => {
  const title = getVehicleTitle(vehicle);

  return (
    <div
      className={cn(
        'group border-surface-600/70 relative overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md',
        archived && 'opacity-80',
      )}
    >
      <Link
        href={`/coches/${encodeURIComponent(vehicle.id)}`}
        aria-label={`Ver detalle de ${title}`}
        className="focus-visible:ring-primary-700 block outline-none focus-visible:ring-2"
      >
        <div className="bg-secondary-50 relative aspect-[16/10] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vehicle.agencyImage || VEHICLE_PLACEHOLDER_SRC}
            alt={vehicle.agencyImage ? `Foto de ${title}` : ''}
            className="size-full object-cover"
            loading="lazy"
          />
          <span className="font-numbers absolute top-2.5 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
            {vehicle.year}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-carbon-500 truncate text-[15px] font-bold">{title}</h3>
            <VehicleStatusBadge status={vehicle.status} className="shrink-0" />
          </div>
          <p className="font-numbers text-carbon-200 truncate text-xs">{vehicle.id}</p>
          <p className="text-carbon-300 flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="border-surface-700/60 size-3 rounded-full border"
              style={{ backgroundColor: getColorSwatch(vehicle.color) }}
            />
            {vehicle.color}
          </p>
        </div>
      </Link>

      <VehicleActionsMenu
        vehicleId={vehicle.id}
        vehicleName={title}
        archived={archived}
        onChanged={onChanged}
        className="absolute top-2 right-2"
        triggerClassName="bg-white/90 hover:bg-white shadow-sm"
      />
    </div>
  );
};

export default VehicleCard;
