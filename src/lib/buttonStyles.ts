import { cn } from '@/lib/utils';

/**
 * Button looks shared across modules, taken from the transactions screens ("Agregar transacción", the detail sheet's
 * Editar/Eliminar): `typo-bold-text` label, `terciary-500` fill that turns `primary-700` on hover, a 10-unit tall hit
 * area and 6-unit horizontal padding. Icons inside are bumped to 20px with `ICON_CLASS`.
 */
const BASE = 'typo-bold-text inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 px-5 py-3';

export const BUTTON_ICON_CLASS = '!size-5';

/** Main call to action (Agregar coche, Agregar socio, Agregar modelo, Editar). */
export const primaryButton = (className?: string) =>
  cn(BASE, 'bg-terciary-500 hover:bg-primary-700 text-primary-100 hover:shadow-sm', className);

/** Neutral secondary action (Catálogo, Volver, Cancelar). */
export const outlineButton = (className?: string) =>
  cn(
    BASE,
    'border-surface-700 text-carbon-500 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 bg-white',
    className,
  );

/** Destructive secondary action (Eliminar). */
export const dangerOutlineButton = (className?: string) =>
  cn(
    BASE,
    'border-error-200 text-error-600 hover:border-error-300 hover:bg-error-50 hover:text-error-700 bg-white',
    className,
  );
