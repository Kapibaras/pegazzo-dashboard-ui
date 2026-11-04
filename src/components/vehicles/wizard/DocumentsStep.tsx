'use client';

import { ExternalLink, Info } from 'lucide-react';
import { getDocumentTypeLabel } from '@/lib/vehicle';
import { VehicleDocument } from '@/types/vehicle';
import DocumentUpload from '../DocumentUpload';
import { StepCard } from './fields';

type DocumentsStepProps = {
  carId: string;
  /** `credit_contract` and `amortization_table` are only expected when the car is not liquidated. */
  isLiquidated: boolean;
  policyExpirationDate?: string;
  existingDocuments?: VehicleDocument[];
};

const BASE_SLOTS = ['invoice', 'insurance_policy', 'circulation_card', 'plates'];
const FINANCING_SLOTS = ['credit_contract', 'amortization_table'];

const DocumentsStep = ({ carId, isLiquidated, policyExpirationDate, existingDocuments = [] }: DocumentsStepProps) => {
  const slots = isLiquidated ? BASE_SLOTS : [...BASE_SLOTS, ...FINANCING_SLOTS];

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3 text-sm" role="note">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          El coche ya está guardado. Los documentos son opcionales y cada archivo se sube en cuanto lo seleccionas: puedes
          finalizar cuando quieras y completar la documentación después desde la edición.
        </p>
      </div>

      <StepCard title="Documentación" description="PDF, JPG, PNG o WEBP. Si es una foto, procura que el documento se vea completo y sin reflejos.">
        <div className="grid gap-5 lg:grid-cols-2">
          {slots.map((type) => {
            const current = existingDocuments.filter((doc) => doc.type === type);
            return (
              <div key={type} className="flex flex-col gap-2">
                {current.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-800 flex w-fit items-center gap-1 text-xs font-medium hover:underline"
                  >
                    Ver documento actual <ExternalLink className="size-3" aria-hidden />
                  </a>
                ))}
                <DocumentUpload
                  entityType="car"
                  entityId={carId}
                  documentType={type}
                  label={current.length > 0 ? `${getDocumentTypeLabel(type)} (reemplazar)` : getDocumentTypeLabel(type)}
                  expiryDate={type === 'insurance_policy' && policyExpirationDate ? `${policyExpirationDate}T00:00:00Z` : undefined}
                  allowRemove={false}
                />
              </div>
            );
          })}
        </div>
      </StepCard>
    </div>
  );
};

export default DocumentsStep;
