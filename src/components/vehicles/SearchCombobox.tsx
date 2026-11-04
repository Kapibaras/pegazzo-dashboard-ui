'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fieldClass } from '@/lib/formField';
import { cn } from '@/lib/utils';

export type ComboboxOption = { value: string; label: string; description?: string };

type SearchComboboxProps = {
  value: string;
  options: ComboboxOption[];
  onSelect: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Renders the "+ create new…" action at the end of the list. Receives the current search text. */
  createLabel?: (query: string) => string;
  onCreate?: (query: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  invalid?: boolean;
  id?: string;
  ariaLabel?: string;
};

/**
 * Input + popover list with search and a trailing "create new" action. Shared by the model, insurer and
 * associate pickers of the wizard (same interaction pattern, per the design handoff).
 */
const SearchCombobox = ({
  value,
  options,
  onSelect,
  placeholder,
  searchPlaceholder = 'Buscar…',
  emptyText = 'Sin resultados.',
  createLabel,
  onCreate,
  disabled,
  isLoading,
  invalid,
  id,
  ariaLabel,
}: SearchComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => `${option.label} ${option.description ?? ''}`.toLowerCase().includes(normalized));
  }, [options, query]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          aria-label={ariaLabel}
          disabled={disabled || isLoading}
          className={fieldClass({
            className: cn(
              'hover:bg-surface-400 w-full cursor-pointer justify-between font-normal has-[>svg]:px-4.5',
              !selected && 'text-muted-foreground',
              invalid && 'border-error-300',
            ),
          })}
        >
          <span className="truncate">{isLoading ? 'Cargando…' : (selected?.label ?? placeholder)}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-2">
        <div className="relative mb-2">
          <Search className="text-carbon-200 pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" aria-hidden />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-8 pl-8"
          />
        </div>

        <ul role="listbox" className="max-h-56 overflow-y-auto">
          {filtered.length === 0 && <li className="text-carbon-300 px-2 py-3 text-center text-sm">{emptyText}</li>}
          {filtered.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(option.value);
                  handleOpenChange(false);
                }}
                className="hover:bg-primary-50 focus-visible:bg-primary-50 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none"
              >
                <Check className={cn('text-success-500 size-4 shrink-0', option.value === value ? 'opacity-100' : 'opacity-0')} />
                <span className="min-w-0 flex-1">
                  <span className="text-carbon-500 block truncate">{option.label}</span>
                  {option.description && <span className="text-carbon-200 block truncate text-xs">{option.description}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {onCreate && createLabel && (
          <button
            type="button"
            onClick={() => {
              const text = query.trim();
              handleOpenChange(false);
              onCreate(text);
            }}
            className="text-primary-800 hover:bg-primary-50 border-surface-600/60 mt-2 flex w-full cursor-pointer items-center gap-2 rounded-md border-t px-2 pt-2.5 pb-1.5 text-left text-sm font-medium"
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{createLabel(query.trim())}</span>
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default SearchCombobox;
