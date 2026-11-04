'use client';

import { Control } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fieldClass } from '@/lib/formField';
import { cn } from '@/lib/utils';
import { VehicleFormValues } from '@/lib/schemas/vehicleSchema';

type StringFieldName = {
  [K in keyof VehicleFormValues]: VehicleFormValues[K] extends string ? K : never;
}[keyof VehicleFormValues];

type TextFieldProps = {
  control: Control<VehicleFormValues>;
  name: StringFieldName;
  label: string;
  placeholder?: string;
  type?: 'text' | 'date' | 'tel';
  inputMode?: 'text' | 'numeric' | 'decimal';
  mono?: boolean;
  disabled?: boolean;
  maxLength?: number;
  hint?: string;
  optional?: boolean;
  suffix?: string;
  className?: string;
};

export const TextField = ({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  inputMode,
  mono,
  disabled,
  maxLength,
  hint,
  optional,
  suffix,
  className,
}: TextFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="text-carbon-400 text-sm font-medium">
          {label}
          {optional && <span className="text-carbon-200 font-normal"> (opcional)</span>}
        </FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              {...field}
              type={type}
              inputMode={inputMode}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              autoComplete="off"
              className={fieldClass({ mono, className: cn('w-full', suffix && 'pr-16') })}
            />
            {suffix && (
              <span className="text-carbon-200 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                {suffix}
              </span>
            )}
          </div>
        </FormControl>
        {hint && <FormDescription className="text-xs">{hint}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

type SelectFieldProps = {
  control: Control<VehicleFormValues>;
  name: StringFieldName;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const SelectField = ({ control, name, label, options, placeholder, disabled, className }: SelectFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="text-carbon-400 text-sm font-medium">{label}</FormLabel>
        <Select value={field.value || undefined} onValueChange={field.onChange} disabled={disabled}>
          <FormControl>
            <SelectTrigger className={fieldClass({ className: 'w-full cursor-pointer' })}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

/** White content card of a wizard step (max-width per the design handoff). */
export const StepCard = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      'border-surface-600/70 flex flex-col gap-5 rounded-xl border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
      className,
    )}
  >
    <header className="space-y-1">
      <h2 className="text-carbon-500 text-lg font-bold">{title}</h2>
      {description && <p className="text-carbon-300 text-sm">{description}</p>}
    </header>
    {children}
  </section>
);

/**
 * Grid of fields. `items-start` keeps every field pinned to the top of its row: without it, a field that grows because it
 * shows a validation message stretches its row and the neighbouring fields push their input down (misaligned inputs).
 */
export const FieldGrid = ({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) => (
  <div className={cn('grid items-start gap-4', columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')}>
    {children}
  </div>
);
