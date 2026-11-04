'use client';

import { UseFormReturn } from 'react-hook-form';
import { VehicleFormValues } from '@/lib/schemas/vehicleSchema';
import { MAX_VEHICLE_PHOTOS } from '@/lib/vehicle';
import ImageUpload, { ImageItem } from '../ImageUpload';
import { FieldGrid, StepCard, TextField } from './fields';
import TireField from './TireField';

type TechnicalStepProps = {
  form: UseFormReturn<VehicleFormValues>;
  photos: ImageItem[];
  onPhotosChange: (items: ImageItem[]) => void;
};

const TechnicalStep = ({ form, photos, onPhotosChange }: TechnicalStepProps) => {
  const { control } = form;

  return (
    <div className="flex flex-col gap-5">
      <StepCard
        title="Datos técnicos"
        description="Estos datos se contrastarán con los documentos del coche: captúralos con cuidado."
      >
        <FieldGrid>
          <TextField control={control} name="vin" label="VIN" placeholder="17 caracteres" maxLength={17} mono />
          <TextField control={control} name="plate" label="Placa" placeholder="ABC-123-D" maxLength={10} mono />
          <TextField control={control} name="engineSerialNumber" label="Serie de motor" maxLength={30} mono />
          <TextField
            control={control}
            name="odometer"
            label="Odómetro"
            inputMode="numeric"
            format="integer"
            suffix="km"
            mono
          />
          <TextField control={control} name="doorsNumber" label="Puertas" inputMode="numeric" mono />
          <TextField control={control} name="passengersNumber" label="Pasajeros" inputMode="numeric" mono />
          <TireField control={control} />
        </FieldGrid>
      </StepCard>

      <StepCard title="Batería">
        <FieldGrid columns={3}>
          <TextField control={control} name="batteryModel" label="Modelo" maxLength={20} />
          <TextField control={control} name="batterySerialNumber" label="Número de serie" maxLength={30} mono />
          <TextField control={control} name="batteryDate" label="Fecha" type="date" mono />
        </FieldGrid>
      </StepCard>

      <StepCard
        title="Fotos del vehículo"
        description={`Hasta ${MAX_VEHICLE_PHOTOS} fotos. Se suben al crear el coche.`}
      >
        <ImageUpload
          label="Fotos"
          items={photos}
          onChange={onPhotosChange}
          max={MAX_VEHICLE_PHOTOS}
          emptyText="Arrastra fotos aquí o haz clic para subir"
        />
      </StepCard>
    </div>
  );
};

export default TechnicalStep;
