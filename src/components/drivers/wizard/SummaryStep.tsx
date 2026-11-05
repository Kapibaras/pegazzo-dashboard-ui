'use client';

import { Home, IdCard, Info, Phone, ShieldCheck, UserRound } from 'lucide-react';
import InfoCard from '@/components/common/InfoCard';
import { StepCard } from '@/components/common/wizard/fields';
import { formatDate } from '@/lib/format';
import { DriverFormValues } from '@/lib/schemas/driverSchema';

type SummaryStepProps = {
  values: DriverFormValues;
  hasPhoto: boolean;
};

const SummaryStep = ({ values, hasPhoto }: SummaryStepProps) => (
  <div className="flex flex-col gap-5">
    <div
      className="typo-sm-text bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3"
      role="note"
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        Revisa los datos antes de crear al conductor. El folio se asignará al crearlo y estos datos se contrastarán con
        los documentos que subas después.
      </p>
    </div>

    <StepCard
      title={`${values.name} ${values.surnames}`.trim()}
      description={`${hasPhoto ? 'Con foto' : 'Sin foto'} · ${values.guarantors.length} ${values.guarantors.length === 1 ? 'aval' : 'avales'}`}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoCard
          icon={UserRound}
          title="Datos personales"
          rows={[
            { label: 'Nombre', value: values.name },
            { label: 'Apellidos', value: values.surnames },
            { label: 'Identificación', value: values.identificationNumber, mono: true },
          ]}
        />
        <InfoCard
          icon={IdCard}
          title="Licencia de conducir"
          rows={[
            { label: 'Número', value: values.licenseNumber, mono: true },
            { label: 'Vigencia', value: formatDate(values.licenseValidity), mono: true },
          ]}
        />
        <InfoCard
          icon={Phone}
          title="Contacto"
          rows={[{ label: 'Teléfonos', value: values.telephones.join(' · '), mono: true }]}
        />
        <InfoCard
          icon={Home}
          title="Domicilio"
          rows={[
            { label: 'Domicilio', value: values.address },
            { label: 'Cocheras', value: values.garageAddress.join(' · ') },
          ]}
        />
        {values.guarantors.map((guarantor, index) => (
          <InfoCard
            key={`${guarantor.name}-${index}`}
            icon={ShieldCheck}
            title={`Aval ${index + 1}`}
            rows={[
              { label: 'Nombre', value: `${guarantor.name} ${guarantor.surnames}`.trim() },
              { label: 'Parentesco', value: guarantor.relation },
              { label: 'Teléfonos', value: guarantor.telephones.join(' · '), mono: true },
              { label: 'Domicilio', value: guarantor.address },
            ]}
          />
        ))}
      </div>
    </StepCard>
  </div>
);

export default SummaryStep;
