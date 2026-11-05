'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/vehicles/PhoneInput';

type PhoneListFieldProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

/** Editable list of phone numbers: existing ones as removable chips plus a PhoneInput to add another. */
const PhoneListField = ({ value, onChange }: PhoneListFieldProps) => {
  const [draft, setDraft] = useState('');
  // PhoneInput keeps its own state, so remounting it (new key) is how it gets cleared after adding.
  const [resetKey, setResetKey] = useState(0);

  const add = () => {
    const phone = draft.trim();
    if (!phone || value.includes(phone)) return;
    onChange([...value, phone]);
    setDraft('');
    setResetKey((key) => key + 1);
  };

  return (
    <div className="grid gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((phone) => (
            <li
              key={phone}
              className="typo-sm-text bg-surface-600/60 text-carbon-500 flex items-center gap-1.5 rounded-full py-1 pr-1.5 pl-3"
            >
              {phone}
              <button
                type="button"
                aria-label={`Quitar ${phone}`}
                onClick={() => onChange(value.filter((item) => item !== phone))}
                className="text-carbon-300 hover:text-error-700 cursor-pointer rounded-full p-0.5"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <PhoneInput key={resetKey} onChange={setDraft} />
        </div>
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

export default PhoneListField;
