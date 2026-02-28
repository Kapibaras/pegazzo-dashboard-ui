'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StepperUnitProps {
  value: number;
  max: number;
  label: string;
  onChange: (v: number) => void;
}

const StepperUnit = ({ value, max, label, onChange }: StepperUnitProps) => {
  const [draft, setDraft] = useState(String(value).padStart(2, '0'));
  const [isFocused, setIsFocused] = useState(false);

  // Stable ref so the debounce effect doesn't re-trigger on every parent render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync from parent only when not focused (value changed via chevrons, not typing)
  useEffect(() => {
    if (!isFocused) {
      setDraft(String(value).padStart(2, '0'));
    }
  }, [value, isFocused]);

  // Debounce: 600ms after the last keystroke, clamp and commit
  useEffect(() => {
    if (!isFocused) return;
    const timer = setTimeout(() => {
      const num = parseInt(draft, 10);
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(0, num), max);
        onChangeRef.current(clamped);
        setDraft(String(clamped).padStart(2, '0'));
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [draft, isFocused, max]);

  const increment = () => onChange((value + 1) % (max + 1));
  const decrement = () => onChange((value - 1 + max + 1) % (max + 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow free typing — only strip non-digits and cap at 2 chars
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDraft(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (value + 1) % (max + 1);
      onChange(next);
      setDraft(String(next).padStart(2, '0'));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (value - 1 + max + 1) % (max + 1);
      onChange(next);
      setDraft(String(next).padStart(2, '0'));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseInt(draft, 10);
    const clamped = isNaN(num) ? 0 : Math.min(Math.max(0, num), max);
    onChange(clamped);
    setDraft(String(clamped).padStart(2, '0'));
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={increment}
        className="group hover:bg-primary-100 flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
      >
        <ChevronUp className="text-carbon-300 group-hover:text-primary-700 size-4 transition-colors" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.select();
        }}
        maxLength={2}
        className="border-primary-700/25 bg-primary-700/10 text-primary-700 focus:border-primary-700/60 focus:ring-primary-700/20 size-14 rounded-xl border text-center font-mono text-2xl font-semibold tabular-nums shadow-inner transition-all outline-none focus:ring-2"
      />

      <button
        type="button"
        onClick={decrement}
        className="group hover:bg-primary-100 flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
      >
        <ChevronDown className="text-carbon-300 group-hover:text-primary-700 size-4 transition-colors" />
      </button>

      <span className="text-carbon-300 text-[0.62rem] font-semibold tracking-widest uppercase">{label}</span>
    </div>
  );
};

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  error?: boolean;
}

const TimePicker = ({ value, onChange, error }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const parts = value.split(':');
  const hh = parseInt(parts[0] ?? '0', 10);
  const mm = parseInt(parts[1] ?? '0', 10);

  const pad = (n: number) => String(n).padStart(2, '0');
  const setHour = (h: number) => onChange(`${pad(h)}:${pad(mm)}`);
  const setMinute = (m: number) => onChange(`${pad(hh)}:${pad(m)}`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'typo-text border-surface-700 bg-surface-400 hover:bg-surface-300 flex shrink-0 cursor-pointer items-center gap-2 self-stretch rounded-md border px-4.5 py-3.5 shadow-sm transition-colors',
            error && 'border-red-500',
          )}
        >
          <Clock className="text-carbon-300 size-4 shrink-0" />
          <span className="text-carbon-500 font-numbers text-base tabular-nums">{value}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="border-surface-700 bg-surface-400 w-auto p-5 shadow-xl" align="end" sideOffset={6}>
        <p className="text-carbon-300 mb-4 text-[0.65rem] font-semibold tracking-widest uppercase">Hora</p>

        <div className="flex items-center gap-2">
          <StepperUnit value={hh} max={23} label="Horas" onChange={setHour} />

          <div className="mb-5 flex flex-col gap-2">
            <div className="bg-carbon-300/30 size-1.5 rounded-full" />
            <div className="bg-carbon-300/30 size-1.5 rounded-full" />
          </div>

          <StepperUnit value={mm} max={59} label="Min" onChange={setMinute} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
