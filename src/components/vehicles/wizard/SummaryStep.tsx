'use client';

import { AlertCircle, Info, Landmark, Loader2, RefreshCw, ShieldCheck, UserRound, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { engineTypeToApi, VehicleFormValues } from '@/lib/schemas/vehicleSchema';
import { formatCurrency, formatDate } from '@/lib/vehicle';
import { Associate, Insurance } from '@/types/vehicle';
import VehicleInfoCard from '../VehicleInfoCard';
import FolioDisplay from './FolioDisplay';
import { StepCard } from './fields';

export type FolioState = { status: 'idle' | 'loading' | 'ready' | 'error'; folio: string; message?: string };

type SummaryStepProps = {
  values: VehicleFormValues;
  folioState: FolioState;
  onRetryFolio: () => void;
  insurance?: Insurance;
  associate?: Associate;
  agencyImageCount: number;
  photoCount: number;
};

const SummaryStep = ({
  values,
  folioState,
  onRetryFolio,
  insurance,
  associate,
  agencyImageCount,
  photoCount,
}: SummaryStepProps) => (
  <div className="flex flex-col gap-5">
    <div className="bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3 text-sm" role="note">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>Revisa los datos antes de crear el coche. Estos datos se contrastarán con los documentos que subas después.</p>
    </div>

    <StepCard
      title={`${values.make} ${values.model} · ${values.year}`}
      description={`${values.color} · ${values.bodyType} · ${engineTypeToApi(values.engineType)}`}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <VehicleInfoCard
          icon={Wrench}
          title="Técnico"
          rows={[
            { label: 'VIN', value: values.vin, mono: true },
            { label: 'Placa', value: values.plate, mono: true },
            { label: 'Transmisión', value: values.transmission === 'TM' ? 'Manual (TM)' : 'Automática (TA)' },
            { label: 'Odómetro', value: `${values.odometer} km`, mono: true },
            { label: 'Fotos', value: `${photoCount} · imagen de agencia: ${agencyImageCount ? 'sí' : 'no'}` },
          ]}
        />
        <VehicleInfoCard
          icon={ShieldCheck}
          title="Seguro"
          rows={[
            { label: 'Aseguradora', value: insurance?.name },
            { label: 'Póliza', value: values.policyNumber, mono: true },
            { label: 'Tipo', value: values.policyType },
            { label: 'Vigencia', value: formatDate(values.policyExpirationDate), mono: true },
          ]}
        />
        <VehicleInfoCard
          icon={Landmark}
          title="Financiamiento"
          rows={
            values.isFinancedLiquidated
              ? [{ label: 'Situación', value: 'Liquidado' }]
              : [
                  { label: 'Agencia', value: values.financingAgency },
                  { label: 'Fecha de compra', value: formatDate(values.financingPurchaseDate), mono: true },
                  { label: 'Plazo', value: `${values.financingTermMonths} meses`, mono: true },
                  { label: 'Restante', value: formatCurrency(values.financingRemainingAmount), mono: true },
                ]
          }
        />
        <VehicleInfoCard
          icon={UserRound}
          title="Socio y propietario"
          rows={[
            { label: 'Socio', value: associate ? `${associate.name} ${associate.surnames}` : undefined },
            { label: 'Propietario legal', value: `${values.legalOwnerName} ${values.legalOwnerSurnames}` },
            { label: 'Valor de unidad', value: formatCurrency(values.unitValue), mono: true },
            { label: 'Factura', value: values.billNumber, mono: true },
          ]}
        />
      </div>
    </StepCard>

    <StepCard
      title="Folio interno (generado automáticamente)"
      description="Es de solo lectura: se arma con el socio, el modelo y la transmisión."
    >
      {folioState.status === 'loading' && (
        <p className="text-carbon-300 flex items-center gap-2 text-sm" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Calculando folio…
        </p>
      )}
      {folioState.status === 'ready' && <FolioDisplay folio={folioState.folio} />}
      {folioState.status === 'error' && (
        <div className="flex flex-wrap items-center gap-3" role="alert">
          <p className="text-error-700 flex items-center gap-2 text-sm">
            <AlertCircle className="size-4" aria-hidden /> {folioState.message ?? 'No se pudo calcular el folio.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetryFolio} className="cursor-pointer gap-2">
            <RefreshCw className="size-3.5" /> Reintentar
          </Button>
        </div>
      )}
    </StepCard>
  </div>
);

export default SummaryStep;
