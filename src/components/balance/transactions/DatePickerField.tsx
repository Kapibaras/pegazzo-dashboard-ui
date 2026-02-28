'use client';

import { useState } from 'react';
import { format, subMonths, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseDateOnly, toLocalISOWithOffset } from '@/utils/formatters';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TimePicker from './TimePicker';
import { formatLongDatetime } from '@/utils/datetime/date';

type DateMode = 'current' | 'custom';

interface DatePickerFieldProps {
  value: string | undefined;
  onChange: (val: string | undefined) => void;
  error?: string;
}

const DatePickerField = ({ onChange, error }: DatePickerFieldProps) => {
  const [mode, setMode] = useState<DateMode>('current');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState(() => format(new Date(), 'HH:mm'));

  const today = new Date();
  const twoMonthsAgo = subMonths(today, 2);
  const selectedDate = selectedDateStr ? parseDateOnly(selectedDateStr) : undefined;

  const handleModeChange = (newMode: DateMode) => {
    setMode(newMode);
    if (newMode === 'current') {
      setSelectedDateStr(undefined);
      onChange(undefined);
      setPopoverOpen(false);
    }
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    setSelectedDateStr(dateStr);
    onChange(toLocalISOWithOffset(dateStr, selectedTime));
    setPopoverOpen(false);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDateStr) onChange(toLocalISOWithOffset(selectedDateStr, time));
  };

  const isDisabled = (date: Date) => isAfter(date, today) || isBefore(date, twoMonthsAgo);

  const pillBase = 'flex-1 px-3 py-1.5 text-sm font-medium transition-all cursor-pointer rounded-lg';
  const pillActive = 'bg-primary-700 text-white shadow-md';
  const pillInactive = 'text-primary-800 hover:bg-primary-100';

  return (
    <div className="space-y-3">
      <div className="bg-primary-100/60 flex gap-1 rounded-xl p-1">
        <button
          type="button"
          onClick={() => handleModeChange('current')}
          className={cn(pillBase, mode === 'current' ? pillActive : pillInactive)}
        >
          Fecha actual
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('custom')}
          className={cn(pillBase, mode === 'custom' ? pillActive : pillInactive)}
        >
          Personalizada
        </button>
      </div>

      {mode === 'current' && (
        <div className="text-carbon-300 text-md mt-3 flex items-start gap-2 px-1">
          <CalendarDays className="mt-0.5 size-5 shrink-0" />
          <span>Hoy, {formatLongDatetime(today.toISOString())}</span>
        </div>
      )}

      {mode === 'custom' && (
        <div className="flex gap-2">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'typo-text border-surface-700 bg-surface-400 hover:bg-surface-300 flex flex-1 cursor-pointer items-center gap-2 self-stretch rounded-md border px-4.5 py-3.5 shadow-sm transition-colors',
                  error && 'border-red-500',
                )}
              >
                <CalendarDays className="text-carbon-300 size-4 shrink-0" />
                <span className={cn('font-numbers text-base', selectedDate ? 'text-carbon-500' : 'text-carbon-300')}>
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: es }) : 'dd/MM/yyyy'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="border-surface-700 bg-surface-400 w-auto p-0 shadow-xl"
              align="start"
              sideOffset={6}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDaySelect}
                disabled={isDisabled}
                defaultMonth={today}
                startMonth={twoMonthsAgo}
                endMonth={today}
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <TimePicker value={selectedTime} onChange={handleTimeChange} error={!!error} />
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
