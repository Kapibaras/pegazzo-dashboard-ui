'use client';

import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDriverFullName } from '@/lib/driver';
import { cn } from '@/lib/utils';
import { DriverSummary } from '@/types/driver';
import { DRIVER_PLACEHOLDER_SRC } from './DriverCard';
import DriverActionsMenu from './DriverActionsMenu';
import DriverStatusBadge from './DriverStatusBadge';

export const DRIVER_TABLE_HEADERS = ['Foto', 'Nombre', 'Id', 'Estado'] as const;

type DriverTableProps = {
  drivers: DriverSummary[];
  archived?: boolean;
  isLoading?: boolean;
  onChanged?: () => void;
};

const DriverTable = ({ drivers, archived = false, isLoading = false, onChanged }: DriverTableProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        'border-secondary-100/80 min-w-0 overflow-hidden rounded-lg border shadow-sm transition-opacity',
        isLoading && 'opacity-60',
      )}
    >
      <Table>
        <TableHeader className="border-primary-700/20 from-secondary-500 to-secondary-600 border-b bg-gradient-to-b">
          <TableRow className="hover:bg-transparent">
            {DRIVER_TABLE_HEADERS.map((header) => (
              <TableHead key={header} className="typo-bold-text text-primary-100 px-5 py-3">
                {header}
              </TableHead>
            ))}
            <TableHead className="w-12 px-3">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => {
            const fullName = getDriverFullName(driver);
            const detailUrl = `/conductores/${encodeURIComponent(driver.id)}`;
            return (
              <TableRow
                key={driver.id}
                tabIndex={0}
                aria-label={`Ver detalle de ${fullName}`}
                className="hover:bg-primary-50/60 focus-visible:bg-primary-50/60 focus-visible:ring-primary-700 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
                onClick={() => router.push(detailUrl)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') router.push(detailUrl);
                }}
              >
                <TableCell className="px-5 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={driver.photo || DRIVER_PLACEHOLDER_SRC}
                    alt=""
                    className="size-12 rounded-full object-cover"
                    loading="lazy"
                  />
                </TableCell>
                <TableCell className="text-carbon-500 px-5 font-semibold">{fullName}</TableCell>
                <TableCell className="typo-sm-text font-numbers text-carbon-300 px-5">{driver.id}</TableCell>
                <TableCell className="px-5">
                  <DriverStatusBadge status={driver.status} />
                </TableCell>
                <TableCell
                  className="px-3"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <DriverActionsMenu
                    driverId={driver.id}
                    driverName={fullName}
                    archived={archived}
                    status={driver.status}
                    onChanged={onChanged}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverTable;
