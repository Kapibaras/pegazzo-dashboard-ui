'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VEHICLE_PLACEHOLDER_SRC } from './VehicleCard';

type VehicleGalleryProps = {
  agencyImage?: string | null;
  photos?: string[] | null;
  title: string;
  className?: string;
};

/** 400×250 carousel of the agency image + up to 4 photos; falls back to the generic placeholder. */
const VehicleGallery = ({ agencyImage, photos, title, className }: VehicleGalleryProps) => {
  const images = [agencyImage, ...(photos ?? [])].filter((src): src is string => !!src);
  const slides = images.length > 0 ? images : [VEHICLE_PLACEHOLDER_SRC];
  const [index, setIndex] = useState(0);
  const current = Math.min(index, slides.length - 1);
  const hasMany = slides.length > 1;

  const go = (delta: number) => setIndex((prev) => (prev + delta + slides.length) % slides.length);

  return (
    <div
      className={cn('from-terciary-500 to-secondary-500 relative h-[250px] w-full max-w-[400px] overflow-hidden rounded-xl bg-gradient-to-br', className)}
      role="group"
      aria-roledescription="carrusel"
      aria-label={`Imágenes de ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={slides[current]}
        src={slides[current]}
        alt={images.length > 0 ? `${title} (${current + 1} de ${slides.length})` : 'Imagen no disponible'}
        className="size-full object-cover"
      />

      {hasMany && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={() => go(1)}
            className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, dot) => (
              <button
                key={dot}
                type="button"
                aria-label={`Ir a la imagen ${dot + 1}`}
                aria-current={dot === current}
                onClick={() => setIndex(dot)}
                className={cn(
                  'size-2 cursor-pointer rounded-full transition-all',
                  dot === current ? 'w-5 bg-white' : 'bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleGallery;
