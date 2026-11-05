'use client';

import ImageUpload, { ImageItem } from '@/components/common/files/ImageUpload';
import { StepCard } from '@/components/common/wizard/fields';

type PhotoStepProps = {
  photos: ImageItem[];
  onPhotosChange: (items: ImageItem[]) => void;
};

const PhotoStep = ({ photos, onPhotosChange }: PhotoStepProps) => (
  <StepCard
    title="Foto del conductor"
    description="Opcional. Se sube al crear al conductor; sin foto se muestra un avatar genérico."
  >
    <ImageUpload
      items={photos}
      onChange={onPhotosChange}
      max={1}
      label="Foto del conductor"
      hint="Una foto de frente, con buena luz."
      emptyText="Arrastra la foto aquí o haz clic para subirla"
    />
  </StepCard>
);

export default PhotoStep;
