'use client';

import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getColorSwatch, getVehicleTitle } from '@/lib/vehicle';
import { VehicleSummary } from '@/types/vehicle';
import { VEHICLE_PLACEHOLDER_SRC } from './VehicleCard';
import VehicleActionsMenu from './VehicleActionsMenu';
import VehicleStatusBadge from './VehicleStatusBadge';

export const VEHICLE_TABLE_HEADERS = ['Imagen', 'Marca y modelo', 'Id', 'Año', 'Color', 'Estado'] as const;

type VehicleTableProps = {
  vehicles: VehicleSummary[];
  archived?: boolean;
  isLoading?: boolean;
  onChanged?: () => void;
};

const VehicleTable = ({ vehicles, archived = false, isLoading = false, onChanged }: VehicleTableProps) => {
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
            {VEHICLE_TABLE_HEADERS.map((header) => (
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
          {vehicles.map((vehicle) => {
            const title = getVehicleTitle(vehicle);
            const detailUrl = `/coches/${encodeURIComponent(vehicle.id)}`;
            return (
              <TableRow
                key={vehicle.id}
                tabIndex={0}
                aria-label={`Ver detalle de ${title}`}
                className="hover:bg-primary-50/60 focus-visible:bg-primary-50/60 focus-visible:ring-primary-700 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
                onClick={() => router.push(detailUrl)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') router.push(detailUrl);
                }}
              >
                <TableCell className="px-5 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicle.agencyImage || VEHICLE_PLACEHOLDER_SRC}
                    alt=""
                    className="h-12 w-[76px] rounded-md object-cover"
                    loading="lazy"
                  />
                </TableCell>
                <TableCell className="text-carbon-500 px-5 font-semibold">{title}</TableCell>
                <TableCell className="typo-sm-text font-numbers text-carbon-300 px-5">{vehicle.id}</TableCell>
                <TableCell className="font-numbers text-carbon-400 px-5">{vehicle.year}</TableCell>
                <TableCell className="text-carbon-400 px-5">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="border-surface-700/60 size-3 rounded-full border"
                      style={{ backgroundColor: getColorSwatch(vehicle.color) }}
                    />
                    {vehicle.color}
                  </span>
                </TableCell>
                <TableCell className="px-5">
                  <VehicleStatusBadge status={vehicle.status} />
                </TableCell>
                <TableCell
                  className="px-3"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <VehicleActionsMenu
                    vehicleId={vehicle.id}
                    vehicleName={title}
                    archived={archived}
                    status={vehicle.status}
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

export default VehicleTable;
