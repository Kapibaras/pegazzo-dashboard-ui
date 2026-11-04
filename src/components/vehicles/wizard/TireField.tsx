'use client';

import { useRef, useState } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { fieldClass } from '@/lib/formField';
import { composeTire, EMPTY_TIRE, parseTire, TireParts } from '@/lib/tire';
import { cn } from '@/lib/utils';
import { VehicleFormValues } from '@/lib/schemas/vehicleSchema';

const PART_INPUT = 'w-full px-2 text-center';

const Part = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className="typo-caption text-carbon-300 text-center">{label}</span>
    {children}
  </div>
);

const Separator = ({ children }: { children: React.ReactNode }) => (
  <span aria-hidden className="typo-kpi-sm text-carbon-300 flex h-[46px] items-center self-end">
    {children}
  </span>
);

type TireInputsProps = { value: string; onChange: (value: string) => void; onBlur: () => void };

const TireInputs = ({ value, onChange, onBlur }: TireInputsProps) => {
  // A value saved as free text (not the standard shape) is shown as-is until the user chooses to retype it.
  const [parts, setParts] = useState<TireParts | null>(() => parseTire(value));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (patch: Partial<TireParts>, focusNext?: number) => {
    const next = { ...(parts ?? EMPTY_TIRE), ...patch };
    setParts(next);
    onChange(composeTire(next));
    if (focusNext !== undefined) refs.current[focusNext]?.focus();
  };

  const digits = (raw: string, max: number) => raw.replace(/\D/g, '').slice(0, max);
  const setRef = (index: number) => (el: HTMLInputElement | null) => {
    refs.current[index] = el;
  };
  const backTo = (index: number, current: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !current) refs.current[index]?.focus();
  };

  if (!parts) {
    return (
      <FormItem className="sm:col-span-2">
        <FormLabel className="typo-label text-carbon-500">Llantas</FormLabel>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={value}
            readOnly
            className={fieldClass({ mono: true, className: 'w-full max-w-xs opacity-80' })}
          />
          <button
            type="button"
            className="typo-label text-primary-800 cursor-pointer hover:underline"
            onClick={() => {
              setParts({ ...EMPTY_TIRE });
              onChange('');
            }}
          >
            Reescribir con el formato estándar
          </button>
        </div>
        <FormDescription className="typo-caption">Este valor se guardó con otro formato.</FormDescription>
      </FormItem>
    );
  }

  const composed = composeTire(parts);

  return (
    <FormItem className="sm:col-span-2">
      <FormLabel className="typo-label text-carbon-500">Llantas</FormLabel>
      <FormControl>
        <div
          role="group"
          aria-label="Código de neumático"
          className="flex flex-wrap items-start gap-x-2 gap-y-3 sm:flex-nowrap"
        >
          <Part label="Ancho (mm)" className="w-24">
            <Input
              ref={setRef(0)}
              value={parts.width}
              inputMode="numeric"
              placeholder="185"
              autoComplete="off"
              aria-label="Ancho en milímetros"
              onBlur={onBlur}
              onChange={(e) => {
                const width = digits(e.target.value, 3);
                update({ width }, width.length === 3 ? 1 : undefined);
              }}
              className={fieldClass({ mono: true, className: PART_INPUT })}
            />
          </Part>
          <Separator>/</Separator>
          <Part label="Perfil (%)" className="w-24">
            <Input
              ref={setRef(1)}
              value={parts.aspect}
              inputMode="numeric"
              placeholder="65"
              autoComplete="off"
              aria-label="Perfil en porcentaje"
              onBlur={onBlur}
              onChange={(e) => {
                const aspect = digits(e.target.value, 2);
                update({ aspect }, aspect.length === 2 ? 2 : undefined);
              }}
              onKeyDown={backTo(0, parts.aspect)}
              className={fieldClass({ mono: true, className: PART_INPUT })}
            />
          </Part>
          <Part label="Tipo" className="w-20">
            <div
              role="radiogroup"
              aria-label="Construcción"
              className="border-surface-700 bg-surface-400 flex h-[46px] overflow-hidden rounded-md border shadow-sm"
            >
              {(['R', 'D'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={parts.construction === option}
                  title={option === 'R' ? 'Radial' : 'Diagonal'}
                  onClick={() => update({ construction: option })}
                  className={cn(
                    'typo-subtitle font-numbers focus-visible:ring-primary-700 flex-1 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset',
                    parts.construction === option ? 'bg-primary-700 text-white' : 'text-carbon-300 hover:bg-primary-50',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </Part>
          <Part label="Rin (pulg.)" className="w-24">
            <Input
              ref={setRef(2)}
              value={parts.rim}
              inputMode="numeric"
              placeholder="15"
              autoComplete="off"
              aria-label="Diámetro del rin en pulgadas"
              onBlur={onBlur}
              onChange={(e) => {
                const rim = digits(e.target.value, 2);
                update({ rim }, rim.length === 2 ? 3 : undefined);
              }}
              onKeyDown={backTo(1, parts.rim)}
              className={fieldClass({ mono: true, className: PART_INPUT })}
            />
          </Part>
          <span aria-hidden className="bg-surface-700/50 mx-1 hidden h-[46px] w-px self-end sm:block" />
          <Part label="Carga (opc.)" className="w-24">
            <Input
              ref={setRef(3)}
              value={parts.load}
              inputMode="numeric"
              placeholder="91"
              autoComplete="off"
              aria-label="Índice de carga, opcional"
              onBlur={onBlur}
              onChange={(e) => {
                const load = digits(e.target.value, 3);
                update({ load });
              }}
              onKeyDown={backTo(2, parts.load)}
              className={fieldClass({ mono: true, className: PART_INPUT })}
            />
          </Part>
          <Part label="Veloc. (opc.)" className="w-24">
            <Input
              ref={setRef(4)}
              value={parts.speed}
              placeholder="H"
              autoComplete="off"
              aria-label="Símbolo de velocidad, opcional"
              onBlur={onBlur}
              onChange={(e) =>
                update({
                  speed: e.target.value
                    .replace(/[^a-zA-Z]/g, '')
                    .toUpperCase()
                    .slice(0, 2),
                })
              }
              onKeyDown={backTo(3, parts.speed)}
              className={fieldClass({ mono: true, className: PART_INPUT })}
            />
          </Part>
        </div>
      </FormControl>
      <FormDescription className="typo-caption">
        {composed ? (
          <>
            Código: <span className="font-numbers text-carbon-400 font-semibold">{composed}</span>
          </>
        ) : (
          'Lo encuentras en el costado de la llanta, por ejemplo 185/65 R15 91H. Carga y velocidad son opcionales.'
        )}
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
};

/**
 * Tyre size split in the parts of the ISO 4000 code (width / aspect + construction + rim, optional load and speed),
 * with the separators drawn for the user. The form value stays a single string ("185/65 R15 91H").
 */
const TireField = ({ control }: { control: Control<VehicleFormValues> }) => (
  <FormField
    control={control}
    name="tireSpecification"
    render={({ field }) => <TireInputs value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
  />
);

export default TireField;
