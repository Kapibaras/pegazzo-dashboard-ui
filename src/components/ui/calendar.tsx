'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4', className)}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          ),
      }}
      classNames={{
        months: 'flex flex-col gap-4',
        month: 'flex flex-col gap-3',
        month_caption: 'relative flex h-9 items-center justify-center',
        caption_label: 'text-sm font-semibold text-carbon-500 tracking-wide',
        nav: 'flex items-center',
        button_previous:
          'absolute left-0 flex size-8 cursor-pointer items-center justify-center rounded-lg text-carbon-300 transition-colors hover:bg-primary-100 hover:text-primary-800',
        button_next:
          'absolute right-0 flex size-8 cursor-pointer items-center justify-center rounded-lg text-carbon-300 transition-colors hover:bg-primary-100 hover:text-primary-800',
        month_grid: 'w-full border-collapse',
        weekdays: 'mb-1 flex',
        weekday: 'w-9 text-center text-[0.68rem] font-semibold uppercase tracking-widest text-carbon-300',
        week: 'flex w-full',
        day: 'relative p-0',
        day_button:
          'flex size-9 cursor-pointer items-center justify-center rounded-full text-sm text-carbon-500 transition-all hover:bg-primary-100 hover:text-primary-800 focus:outline-none',
        selected:
          '[&>button]:bg-primary-700 [&>button]:text-white [&>button]:shadow-sm [&>button]:hover:bg-primary-700 [&>button]:hover:text-white',
        today: '[&>button]:font-bold [&>button]:text-primary-700 [&>button]:ring-1 [&>button]:ring-primary-700/40 [&>button]:ring-inset',
        outside: '[&>button]:text-carbon-300 [&>button]:opacity-35 [&>button]:hover:bg-transparent',
        disabled:
          '[&>button]:cursor-not-allowed [&>button]:opacity-20 [&>button]:hover:bg-transparent',
        range_middle: '[&>button]:rounded-none [&>button]:bg-primary-100',
        hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
};

Calendar.displayName = 'Calendar';

export { Calendar };
