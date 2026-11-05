import Link from 'next/link';
import { getDriverFullName } from '@/lib/driver';
import { cn } from '@/lib/utils';
import { DriverSummary } from '@/types/driver';
import DriverActionsMenu from './DriverActionsMenu';
import DriverStatusBadge from './DriverStatusBadge';

type DriverCardProps = {
  driver: DriverSummary;
  archived?: boolean;
  onChanged?: () => void;
};

/** Generic avatar shown when the driver has no photo. */
export const DRIVER_PLACEHOLDER_SRC = '/images/driver-placeholder.svg';

const DriverCard = ({ driver, archived = false, onChanged }: DriverCardProps) => {
  const fullName = getDriverFullName(driver);

  return (
    <div
      className={cn(
        'group border-surface-600/70 relative overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        archived && 'opacity-80',
      )}
    >
      <Link
        href={`/conductores/${encodeURIComponent(driver.id)}`}
        aria-label={`Ver detalle de ${fullName}`}
        className="focus-visible:ring-primary-700 block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset"
      >
        <div className="bg-secondary-50 relative aspect-[4/3] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={driver.photo || DRIVER_PLACEHOLDER_SRC}
            alt={driver.photo ? `Foto de ${fullName}` : ''}
            className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col gap-1.5 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="typo-bold-text text-carbon-500 group-hover:text-primary-800 truncate transition-colors">
              {fullName}
            </h3>
            <DriverStatusBadge status={driver.status} className="shrink-0" />
          </div>
          <p className="typo-caption font-numbers text-carbon-300 truncate">{driver.id}</p>
        </div>
      </Link>

      <DriverActionsMenu
        driverId={driver.id}
        driverName={fullName}
        archived={archived}
        status={driver.status}
        onChanged={onChanged}
        className="absolute top-2 right-2"
        triggerClassName="bg-white/90 hover:bg-white shadow-sm"
      />
    </div>
  );
};

export default DriverCard;
