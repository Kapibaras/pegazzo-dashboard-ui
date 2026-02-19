'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BALANCE_PERIODS, DEFAULT_PERIOD } from '@/types/balance';
import { parsePeriod, PERIOD_LABELS } from '@/lib/balance';

const PeriodSelector = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentPeriod = parsePeriod(searchParams.get('period') ?? undefined);

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === DEFAULT_PERIOD) {
      params.delete('period');
    } else {
      params.set('period', value);
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(url, { scroll: false });
    });
  };

  return (
    <Tabs value={currentPeriod} onValueChange={handlePeriodChange}>
      <TabsList aria-label="Seleccionar período" className="h-10 gap-1 rounded-xl bg-primary-100/60 p-1">
        {BALANCE_PERIODS.map((period) => (
          <TabsTrigger
            key={period}
            value={period}
            disabled={isPending}
            className="cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium text-primary-800 transition-all data-[state=active]:bg-primary-700 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-primary-100 disabled:opacity-40"
          >
            {PERIOD_LABELS[period]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default PeriodSelector;
