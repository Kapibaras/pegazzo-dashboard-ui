'use client';

import { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fieldClass } from '@/lib/formField';
import { caretForCount, countSignificant, formatNumberDisplay, NumberFormat, sanitizeNumber } from '@/lib/inputFormat';
import { cn } from '@/lib/utils';

/** Names of the form fields that hold a string. */
export type StringFieldName<T extends FieldValues> = {
  [K in FieldPath<T>]: FieldPathValue<T, K> extends string ? K : never;
}[FieldPath<T>];

type TextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: StringFieldName<T>;
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
  /** Converts what the user types before it reaches the form, e.g. to upper case for a CURP. */
  transform?: (value: string) => string;
  /** Shows the number with thousands separators while typing; the form value stays raw ("1234567.5"). */
  format?: NumberFormat;
  className?: string;
};

export const TextField = <T extends FieldValues>({
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
  transform,
  format,
  className,
}: TextFieldProps<T>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="typo-label text-carbon-500">
          {label}
          {optional && <span className="text-carbon-300 font-normal"> (opcional)</span>}
        </FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              {...field}
              value={format ? formatNumberDisplay(field.value) : field.value}
              onChange={
                format
                  ? (event) => {
                      const input = event.target;
                      const count = countSignificant(input.value, input.selectionStart ?? input.value.length);
                      const raw = sanitizeNumber(input.value, format);
                      field.onChange(raw);
                      // Keep the caret next to the same digit after the commas are re-inserted.
                      const caret = caretForCount(formatNumberDisplay(raw), Math.min(count, raw.length));
                      requestAnimationFrame(() => input.setSelectionRange(caret, caret));
                    }
                  : transform
                    ? (event) => field.onChange(transform(event.target.value))
                    : field.onChange
              }
              type={type}
              inputMode={inputMode}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              autoComplete="off"
              className={fieldClass({ mono, className: cn('w-full', suffix && 'pr-16') })}
            />
            {suffix && (
              <span className="typo-caption text-carbon-300 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                {suffix}
              </span>
            )}
          </div>
        </FormControl>
        {hint && <FormDescription className="typo-caption">{hint}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

type SelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: StringFieldName<T>;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const SelectField = <T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  disabled,
  className,
}: SelectFieldProps<T>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="typo-label text-carbon-500">{label}</FormLabel>
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
      <h2 className="typo-subtitle text-carbon-500">{title}</h2>
      {description && <p className="typo-sm-text text-carbon-300">{description}</p>}
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
