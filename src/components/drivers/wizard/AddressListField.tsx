'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fieldClass } from '@/lib/formField';

type AddressListFieldProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
  maxLength?: number;
};

/** Editable list of addresses (garages): existing ones as removable chips plus an input to add another. */
const AddressListField = ({ value, onChange, placeholder, ariaLabel, maxLength = 255 }: AddressListFieldProps) => {
  const [draft, setDraft] = useState('');

  const add = () => {
    const address = draft.trim();
    if (!address || value.includes(address)) return;
    onChange([...value, address]);
    setDraft('');
  };

  return (
    <div className="grid gap-2">
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((address) => (
            <li
              key={address}
              className="typo-sm-text bg-surface-600/60 text-carbon-500 flex items-center justify-between gap-2 rounded-lg py-1.5 pr-2 pl-3"
            >
              <span className="min-w-0 break-words">{address}</span>
              <button
                type="button"
                aria-label={`Quitar ${address}`}
                onClick={() => onChange(value.filter((item) => item !== address))}
                className="text-carbon-300 hover:text-error-700 shrink-0 cursor-pointer rounded-full p-0.5"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-start gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          maxLength={maxLength}
          autoComplete="off"
          className={fieldClass({ className: 'min-w-0 flex-1' })}
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          disabled={!draft.trim()}
          className="h-[52px] shrink-0 cursor-pointer gap-1"
        >
          <Plus className="size-4" /> Agregar
        </Button>
      </div>
    </div>
  );
};

export default AddressListField;
