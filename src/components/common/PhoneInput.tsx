'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fieldClass } from '@/lib/formField';
import { composePhone, DEFAULT_DIAL_CODE, DIAL_CODES, formatPhoneDigits, PHONE_MAX_DIGITS } from '@/lib/inputFormat';

type PhoneInputProps = {
  id?: string;
  /** Joined value ("+52 55 1234 5678") reported on every change; '' when nothing was typed. */
  onChange: (value: string) => void;
  invalid?: boolean;
};

/**
 * Phone with a country-code dropdown and the number formatted while typing: two digits first, then groups of four
 * ("55 1234 5678"). The parent only sees the joined value.
 */
const PhoneInput = ({ id, onChange, invalid }: PhoneInputProps) => {
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [digits, setDigits] = useState('');

  return (
    <div className="flex gap-2">
      <Select
        value={dialCode}
        onValueChange={(next) => {
          setDialCode(next);
          onChange(composePhone(next, digits));
        }}
      >
        <SelectTrigger
          aria-label="Código de país"
          className={fieldClass({ className: 'w-[110px] shrink-0 cursor-pointer' })}
        >
          <SelectValue>{dialCode}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DIAL_CODES.map((option) => (
            <SelectItem key={option.code} value={option.code} className="cursor-pointer">
              <span className="font-numbers">{option.code}</span>
              <span className="text-carbon-300 ml-2">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        placeholder="55 1234 5678"
        aria-invalid={invalid}
        value={formatPhoneDigits(digits)}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
          setDigits(next);
          onChange(composePhone(dialCode, next));
        }}
        className={fieldClass({ mono: true, className: 'w-full' })}
      />
    </div>
  );
};

export default PhoneInput;
